import type { Express, NextFunction, Request, Response } from "express";
import { count, desc, eq, sql, sum } from "drizzle-orm";
import { adminAuditLogs, aiUsage, siteSettings, users, type User } from "../drizzle/schema";
import { getDb } from "./db";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";

const AI_ENABLED_KEY = "qubit_ai_enabled";
const FREE_DAILY_LIMIT = 5;
let controlTablesReady = false;

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;

async function ensureControlTables(db: Database): Promise<void> {
  if (controlTablesReady) return;

  await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS site_settings (
    \`key\` VARCHAR(64) NOT NULL PRIMARY KEY,
    \`value\` TEXT NOT NULL,
    \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`));

  await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS admin_audit_logs (
    \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`actorUserId\` INT NOT NULL,
    \`action\` VARCHAR(96) NOT NULL,
    \`targetUserId\` INT NULL,
    \`metadata\` TEXT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`));

  controlTablesReady = true;
}

async function getAuthenticatedUser(req: Request, res: Response): Promise<User | null> {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      res.status(401).json({ error: "Sign in is required." });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ error: "Your session has expired. Please sign in again." });
    return null;
  }
}

async function getAdminUser(req: Request, res: Response): Promise<User | null> {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    res.status(403).json({ error: "Owner access is required." });
    return null;
  }
  return user;
}

async function readAiEnabled(db: Database): Promise<boolean> {
  await ensureControlTables(db);
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, AI_ENABLED_KEY)).limit(1);
  if (rows.length === 0) return ENV.aiEnabled;
  return rows[0].value !== "false";
}

async function writeAudit(
  db: Database,
  actorUserId: number,
  action: string,
  targetUserId?: number,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await ensureControlTables(db);
  await db.insert(adminAuditLogs).values({
    actorUserId,
    action,
    targetUserId: targetUserId ?? null,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

export async function enforceAiRuntimeControl(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.path.includes("ai.chat")) {
    next();
    return;
  }

  const db = await getDb();
  if (!db) {
    if (!ENV.aiEnabled) {
      res.status(503).json({ error: "Qubit AI is temporarily disabled." });
      return;
    }
    next();
    return;
  }

  try {
    if (!(await readAiEnabled(db))) {
      res.status(503).json({ error: "Qubit AI is temporarily disabled by the site owner." });
      return;
    }
    next();
  } catch (error) {
    console.error("[Admin] Failed to read AI runtime control", error);
    res.status(503).json({ error: "Qubit AI status could not be verified." });
  }
}

export function registerMemberAdminRoutes(app: Express): void {
  app.get("/api/member/dashboard", async (req, res) => {
    const user = await getAuthenticatedUser(req, res);
    if (!user) return;

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Member data is temporarily unavailable." });
      return;
    }

    const date = new Date().toISOString().slice(0, 10);
    const usageRows = await db
      .select()
      .from(aiUsage)
      .where(sql`${aiUsage.userId} = ${user.id} AND ${aiUsage.date} = ${date}`)
      .limit(1);
    const usedToday = usageRows[0]?.count ?? 0;
    const isPro = user.subscriptionStatus === "pro";

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        membership: user.subscriptionStatus,
        loginMethod: user.loginMethod,
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
      },
      aiUsage: {
        date,
        usedToday,
        limit: isPro ? null : FREE_DAILY_LIMIT,
        remaining: isPro ? null : Math.max(0, FREE_DAILY_LIMIT - usedToday),
      },
    });
  });

  app.get("/api/admin/dashboard", async (req, res) => {
    const admin = await getAdminUser(req, res);
    if (!admin) return;

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Administration data is temporarily unavailable." });
      return;
    }

    await ensureControlTables(db);
    const date = new Date().toISOString().slice(0, 10);
    const [totalRows, proRows, adminRows, usageRows, memberRows, auditRows] = await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(users).where(eq(users.subscriptionStatus, "pro")),
      db.select({ value: count() }).from(users).where(eq(users.role, "admin")),
      db.select({ value: sum(aiUsage.count) }).from(aiUsage).where(eq(aiUsage.date, date)),
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          membership: users.subscriptionStatus,
          loginMethod: users.loginMethod,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(100),
      db.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(20),
    ]);

    res.json({
      summary: {
        totalMembers: Number(totalRows[0]?.value ?? 0),
        proMembers: Number(proRows[0]?.value ?? 0),
        administrators: Number(adminRows[0]?.value ?? 0),
        aiRequestsToday: Number(usageRows[0]?.value ?? 0),
        aiEnabled: await readAiEnabled(db),
        foundryConfigured: ENV.aiConfigured,
      },
      users: memberRows,
      auditLog: auditRows,
    });
  });

  app.post("/api/admin/users/:userId/membership", async (req, res) => {
    const admin = await getAdminUser(req, res);
    if (!admin) return;

    const userId = Number.parseInt(req.params.userId, 10);
    const membership = req.body?.membership;
    if (!Number.isInteger(userId) || (membership !== "free" && membership !== "pro")) {
      res.status(400).json({ error: "Choose a valid member and membership level." });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Administration data is temporarily unavailable." });
      return;
    }

    const targetRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const target = targetRows[0];
    if (!target) {
      res.status(404).json({ error: "Member not found." });
      return;
    }

    await db.update(users).set({ subscriptionStatus: membership }).where(eq(users.id, userId));
    await writeAudit(db, admin.id, "membership.updated", userId, {
      previous: target.subscriptionStatus,
      next: membership,
    });
    res.json({ ok: true });
  });

  app.post("/api/admin/users/:userId/role", async (req, res) => {
    const admin = await getAdminUser(req, res);
    if (!admin) return;

    const userId = Number.parseInt(req.params.userId, 10);
    const role = req.body?.role;
    if (!Number.isInteger(userId) || (role !== "user" && role !== "admin")) {
      res.status(400).json({ error: "Choose a valid member and role." });
      return;
    }
    if (userId === admin.id && role !== "admin") {
      res.status(400).json({ error: "You cannot remove your own owner access." });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Administration data is temporarily unavailable." });
      return;
    }

    const targetRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const target = targetRows[0];
    if (!target) {
      res.status(404).json({ error: "Member not found." });
      return;
    }

    await db.update(users).set({ role }).where(eq(users.id, userId));
    await writeAudit(db, admin.id, "role.updated", userId, { previous: target.role, next: role });
    res.json({ ok: true });
  });

  app.post("/api/admin/ai-enabled", async (req, res) => {
    const admin = await getAdminUser(req, res);
    if (!admin) return;
    if (typeof req.body?.enabled !== "boolean") {
      res.status(400).json({ error: "The AI control requires an enabled value." });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Administration data is temporarily unavailable." });
      return;
    }

    await ensureControlTables(db);
    const previous = await readAiEnabled(db);
    const value = req.body.enabled ? "true" : "false";
    await db.insert(siteSettings).values({ key: AI_ENABLED_KEY, value }).onDuplicateKeyUpdate({ set: { value } });
    await writeAudit(db, admin.id, "qubit_ai.enabled.updated", undefined, {
      previous,
      next: req.body.enabled,
    });
    res.json({ ok: true, enabled: req.body.enabled });
  });
}
