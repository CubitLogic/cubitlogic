import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { randomUUID } from "node:crypto";
import { InsertUser, User, users } from "../drizzle/schema";
import { notifications } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _schemaReady = false;

function getDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  // GoDaddy injects these values when its Hosted Database is attached.
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
  if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASSWORD) return undefined;

  const user = encodeURIComponent(DB_USER);
  const password = encodeURIComponent(DB_PASSWORD);
  const port = DB_PORT ? `:${DB_PORT}` : "";
  return `mysql://${user}:${password}@${DB_HOST}${port}/${DB_NAME}`;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  const databaseUrl = getDatabaseUrl();
  if (!_db && databaseUrl) {
    try {
      _db = drizzle(databaseUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/** Create the app tables in GoDaddy's attached MySQL database on first run. */
export async function initializeDatabase(): Promise<void> {
  if (_schemaReady) return;
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Hosted database variables are unavailable");
    return;
  }

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      openId VARCHAR(64) NOT NULL UNIQUE,
      name TEXT NULL,
      email VARCHAR(320) NULL,
      passwordHash VARCHAR(255) NULL,
      loginMethod VARCHAR(64) NULL,
      role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
      stripeCustomerId VARCHAR(64) NULL,
      stripeSubscriptionId VARCHAR(64) NULL,
      subscriptionStatus ENUM('free', 'pro') NOT NULL DEFAULT 'free',
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      lastSignedIn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY users_email_unique (email)
    )`,
    `CREATE TABLE IF NOT EXISTS ai_usage (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      date VARCHAR(10) NOT NULL,
      count INT NOT NULL DEFAULT 0,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY ai_usage_user_date_unique (userId, date)
    )`,
    `CREATE TABLE IF NOT EXISTS news_preferences (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL UNIQUE,
      enabledCategories TEXT NOT NULL,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(320) NOT NULL UNIQUE,
      subscribedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('welcome', 'subscription', 'system', 'admin') NOT NULL DEFAULT 'system',
      isRead INT NOT NULL DEFAULT 0,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS notification_reads (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      notificationId INT NOT NULL,
      userId INT NOT NULL,
      readAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY notification_reads_unique (notificationId, userId)
    )`,
    `CREATE TABLE IF NOT EXISTS site_settings (
      \`key\` VARCHAR(64) NOT NULL PRIMARY KEY,
      \`value\` TEXT NOT NULL,
      \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      actorUserId INT NOT NULL,
      action VARCHAR(96) NOT NULL,
      targetUserId INT NULL,
      metadata TEXT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS stripe_webhook_events (
      eventId VARCHAR(255) NOT NULL PRIMARY KEY,
      eventType VARCHAR(96) NOT NULL,
      livemode INT NOT NULL,
      status ENUM('processing', 'processed') NOT NULL DEFAULT 'processing',
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      processedAt TIMESTAMP NULL
    )`,
  ];

  for (const statement of statements) {
    await db.execute(statement);
  }
  _schemaReady = true;
  console.log("[Database] Cubit Logic tables are ready");
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createLocalUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const email = input.email.trim().toLowerCase();
  const role = ENV.ownerEmail && email === ENV.ownerEmail ? "admin" : "user";
  const openId = `local_${randomUUID()}`;
  await db.insert(users).values({
    openId,
    name: input.name.trim(),
    email,
    passwordHash: input.passwordHash,
    loginMethod: "email",
    role,
    lastSignedIn: new Date(),
  });

  const user = await getUserByEmail(email);
  if (!user) throw new Error("Account creation did not complete");
  return user;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Check if this is a brand-new user (not yet in DB)
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.openId, user.openId)).limit(1);
    const isNewUser = existing.length === 0;

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    // Send welcome notification for first-time users
    if (isNewUser) {
      const newUserRows = await db.select({ id: users.id }).from(users).where(eq(users.openId, user.openId)).limit(1);
      if (newUserRows.length > 0) {
        await db.insert(notifications).values({
          userId: newUserRows[0].id,
          title: "Welcome to CubitLogic!",
          message: "Thanks for joining! Explore quantum computing topics, try the AI Tutor, or dive into the Prompt Engineering course. Everything is free to start.",
          type: "welcome",
        });
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.
