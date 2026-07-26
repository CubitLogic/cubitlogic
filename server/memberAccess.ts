import { eq, sql } from "drizzle-orm";
import { siteSettings, type User } from "../drizzle/schema";
import type { getDb } from "./db";

export const FREE_DAILY_LIMIT = 5;
export type MemberAiAccessMode = "automatic" | "enabled" | "disabled";

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export type MemberAiAccess = {
  mode: MemberAiAccessMode;
  enabled: boolean;
  unlimited: boolean;
  source: "free" | "supporter" | "owner_enabled" | "owner_disabled";
};

let settingsTableReady = false;

function memberAiAccessKey(userId: number): string {
  return `member_ai_access:${userId}`;
}

export async function ensureMemberAccessStorage(db: Database): Promise<void> {
  if (settingsTableReady) return;

  await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS site_settings (
    \`key\` VARCHAR(64) NOT NULL PRIMARY KEY,
    \`value\` TEXT NOT NULL,
    \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`));
  settingsTableReady = true;
}

export function resolveMemberAiAccess(
  mode: MemberAiAccessMode,
  membership: User["subscriptionStatus"],
): MemberAiAccess {
  if (mode === "disabled") {
    return { mode, enabled: false, unlimited: false, source: "owner_disabled" };
  }
  if (mode === "enabled") {
    return { mode, enabled: true, unlimited: true, source: "owner_enabled" };
  }
  if (membership === "pro") {
    return { mode, enabled: true, unlimited: true, source: "supporter" };
  }
  return { mode, enabled: true, unlimited: false, source: "free" };
}

export async function readMemberAiAccess(
  db: Database,
  user: Pick<User, "id" | "subscriptionStatus">,
): Promise<MemberAiAccess> {
  await ensureMemberAccessStorage(db);
  const rows = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, memberAiAccessKey(user.id)))
    .limit(1);
  const stored = rows[0]?.value;
  const mode: MemberAiAccessMode =
    stored === "enabled" || stored === "disabled" ? stored : "automatic";
  return resolveMemberAiAccess(mode, user.subscriptionStatus);
}

export async function writeMemberAiAccess(
  db: Database,
  userId: number,
  mode: MemberAiAccessMode,
): Promise<void> {
  await ensureMemberAccessStorage(db);
  const key = memberAiAccessKey(userId);
  if (mode === "automatic") {
    await db.delete(siteSettings).where(eq(siteSettings.key, key));
    return;
  }
  await db
    .insert(siteSettings)
    .values({ key, value: mode })
    .onDuplicateKeyUpdate({ set: { value: mode } });
}
