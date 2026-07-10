import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "./_core/trpc";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { notifications, notificationReads } from "../drizzle/schema";
import { eq, and, or, desc, sql, inArray } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

// Helper: create a notification for a specific user
export async function createNotification(opts: {
  userId: number;
  title: string;
  message: string;
  type: "welcome" | "subscription" | "system" | "admin";
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values({
    userId: opts.userId,
    title: opts.title,
    message: opts.message,
    type: opts.type,
  });
}

// Helper: create a broadcast notification (userId = 0 means all users)
export async function createBroadcastNotification(opts: {
  title: string;
  message: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values({
    userId: 0,
    title: opts.title,
    message: opts.message,
    type: "admin",
  });
}

// Helper: send owner alert via Manus notification service
export async function alertOwner(title: string, content: string) {
  try {
    await notifyOwner({ title, content });
  } catch (err) {
    console.warn("[NotificationRouter] Owner alert failed:", err);
  }
}

export const notificationRouter = router({
  // Get notifications for the current user (personal + broadcasts) with per-user read state
  list: protectedProcedure.query(async ({ ctx }: { ctx: TrpcContext & { user: NonNullable<TrpcContext["user"]> } }) => {
    const db = await getDb();
    if (!db) return { notifications: [], unreadCount: 0 };

    // Fetch all notifications for this user (personal) or broadcasts (userId=0)
    const rows = await db
      .select()
      .from(notifications)
      .where(or(eq(notifications.userId, ctx.user.id), eq(notifications.userId, 0)))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    if (rows.length === 0) return { notifications: [], unreadCount: 0 };

    // For personal notifications, isRead field is authoritative.
    // For broadcasts (userId=0), check notification_reads table for this user.
    const broadcastIds = rows.filter((n) => n.userId === 0).map((n) => n.id);
    let readBroadcastIds = new Set<number>();

    if (broadcastIds.length > 0) {
      const readRows = await db
        .select({ notificationId: notificationReads.notificationId })
        .from(notificationReads)
        .where(
          and(
            eq(notificationReads.userId, ctx.user.id),
            inArray(notificationReads.notificationId, broadcastIds)
          )
        );
      readBroadcastIds = new Set(readRows.map((r) => r.notificationId));
    }

    // Merge read state
    const merged = rows.map((n) => {
      const isRead = n.userId === 0
        ? readBroadcastIds.has(n.id) ? 1 : 0
        : n.isRead;
      return { ...n, isRead };
    });

    const unreadCount = merged.filter((n) => n.isRead === 0).length;
    return { notifications: merged, unreadCount };
  }),

  // Get unread count only (lightweight poll)
  unreadCount: protectedProcedure.query(async ({ ctx }: { ctx: TrpcContext & { user: NonNullable<TrpcContext["user"]> } }) => {
    const db = await getDb();
    if (!db) return { count: 0 };

    // Count personal unread
    const personalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.isRead, 0)
        )
      );
    const personalUnread = personalResult[0]?.count ?? 0;

    // Count broadcast unread (broadcasts not in notification_reads for this user)
    const broadcastResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(eq(notifications.userId, 0));
    const totalBroadcasts = broadcastResult[0]?.count ?? 0;

    const readBroadcastResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notificationReads)
      .where(eq(notificationReads.userId, ctx.user.id));
    const readBroadcasts = readBroadcastResult[0]?.count ?? 0;

    const unreadBroadcasts = Math.max(0, totalBroadcasts - readBroadcasts);

    return { count: personalUnread + unreadBroadcasts };
  }),

  // Mark a single notification as read
  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }: { input: { id: number }; ctx: TrpcContext & { user: NonNullable<TrpcContext["user"]> } }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // Check if this is a broadcast or personal notification
      const rows = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, input.id))
        .limit(1);

      if (rows.length === 0) return { success: false };
      const notification = rows[0];

      if (notification.userId === 0) {
        // Broadcast: insert into notification_reads for this user
        try {
          await db.insert(notificationReads).values({
            notificationId: input.id,
            userId: ctx.user.id,
          });
        } catch {
          // Already marked as read (duplicate) — ignore
        }
      } else if (notification.userId === ctx.user.id) {
        // Personal: update isRead flag
        await db
          .update(notifications)
          .set({ isRead: 1 })
          .where(eq(notifications.id, input.id));
      }

      return { success: true };
    }),

  // Mark all notifications as read for the current user
  markAllRead: protectedProcedure.mutation(async ({ ctx }: { ctx: TrpcContext & { user: NonNullable<TrpcContext["user"]> } }) => {
    const db = await getDb();
    if (!db) return { success: false };

    // Mark all personal notifications as read
    await db
      .update(notifications)
      .set({ isRead: 1 })
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.isRead, 0)
        )
      );

    // Mark all broadcasts as read for this user
    const unreadBroadcasts = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(eq(notifications.userId, 0));

    if (unreadBroadcasts.length > 0) {
      // Get already-read broadcast IDs for this user
      const alreadyRead = await db
        .select({ notificationId: notificationReads.notificationId })
        .from(notificationReads)
        .where(eq(notificationReads.userId, ctx.user.id));
      const alreadyReadSet = new Set(alreadyRead.map((r) => r.notificationId));

      // Insert reads for any broadcasts not yet marked
      const toInsert = unreadBroadcasts
        .filter((b) => !alreadyReadSet.has(b.id))
        .map((b) => ({ notificationId: b.id, userId: ctx.user.id }));

      if (toInsert.length > 0) {
        await db.insert(notificationReads).values(toInsert);
      }
    }

    return { success: true };
  }),

  // Admin: broadcast a notification to all users
  broadcast: adminProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      message: z.string().min(1).max(2000),
    }))
    .mutation(async ({ input }) => {
      await createBroadcastNotification({
        title: input.title,
        message: input.message,
      });
      return { success: true };
    }),

  // Admin: send notification to a specific user by ID
  sendToUser: adminProcedure
    .input(z.object({
      userId: z.number(),
      title: z.string().min(1).max(255),
      message: z.string().min(1).max(2000),
      type: z.enum(["welcome", "subscription", "system", "admin"]).default("admin"),
    }))
    .mutation(async ({ input }) => {
      await createNotification({
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type,
      });
      return { success: true };
    }),
});
