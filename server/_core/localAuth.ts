import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

const scrypt = promisify(scryptCallback);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidAccountInput(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasSessionSecret(): boolean {
  return ENV.cookieSecret.trim().length >= 32;
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function matchesPassword(password: string, stored: string): Promise<boolean> {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function startSession(req: Request, res: Response, user: { openId: string; name: string | null; email: string | null }) {
  const name = user.name?.trim() || user.email || "Cubit Logic member";
  const token = await sdk.createSessionToken(user.openId, { name, expiresInMs: ONE_YEAR_MS });
  res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    maxAge: ONE_YEAR_MS,
  });
}

export function registerLocalAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { name, email, password } = req.body ?? {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!isValidAccountInput(name) || !emailPattern.test(normalizedEmail) || typeof password !== "string" || password.length < 8) {
      res.status(400).json({ error: "Enter your name, a valid email, and a password of at least 8 characters." });
      return;
    }

    if (!hasSessionSecret()) {
      console.error("[Auth] Registration is disabled because JWT_SECRET is missing or too short");
      res.status(503).json({ error: "Account creation is temporarily unavailable." });
      return;
    }

    try {
      if (await db.getUserByEmail(normalizedEmail)) {
        res.status(409).json({ error: "An account already exists for that email. Please sign in." });
        return;
      }
      const user = await db.createLocalUser({
        name,
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
      });
      await startSession(req, res, user);
      res.status(201).json({ ok: true });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      res.status(500).json({ error: "Account creation is temporarily unavailable." });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!emailPattern.test(normalizedEmail) || typeof password !== "string") {
      res.status(400).json({ error: "Enter your email and password." });
      return;
    }

    if (!hasSessionSecret()) {
      console.error("[Auth] Sign-in is disabled because JWT_SECRET is missing or too short");
      res.status(503).json({ error: "Sign-in is temporarily unavailable." });
      return;
    }

    try {
      const user = await db.getUserByEmail(normalizedEmail);
      if (!user?.passwordHash || !(await matchesPassword(password, user.passwordHash))) {
        res.status(401).json({ error: "Email or password is incorrect." });
        return;
      }
      await db.upsertUser({
        openId: user.openId,
        lastSignedIn: new Date(),
        ...(ENV.ownerEmail && normalizedEmail === ENV.ownerEmail ? { role: "admin" as const } : {}),
      });
      await startSession(req, res, user);
      res.json({ ok: true });
    } catch (error) {
      console.error("[Auth] Sign-in failed", error);
      res.status(500).json({ error: "Sign-in is temporarily unavailable." });
    }
  });
}
