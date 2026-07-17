import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import type { TrpcContext } from "./_core/context";
import { z } from "zod";
import Stripe from "stripe";
import { getDb } from "./db";
import { users, aiUsage, newsletterSubscribers } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { newsRouter } from "./newsRouter";
import { paypalRouter } from "./paypalRouter";
import { notificationRouter, alertOwner } from "./notificationRouter";
import { createHash } from "node:crypto";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2026-06-24.dahlia" })
  : null;
const FREE_DAILY_LIMIT = 5;
const ANONYMOUS_CHAT_COOLDOWN_MS = 8_000;

type AnonymousUsage = { date: string; count: number; lastRequestAt: number };
const anonymousUsage = new Map<string, AnonymousUsage>();

function anonymousClientId(ctx: TrpcContext) {
  const forwarded = ctx.req.headers["x-forwarded-for"];
  const source = Array.isArray(forwarded)
    ? forwarded[0] ?? ctx.req.ip ?? "unknown"
    : forwarded?.split(",")[0]?.trim() || ctx.req.ip || "unknown";
  return createHash("sha256").update(source).digest("hex");
}

function getAnonymousUsage(ctx: TrpcContext) {
  const key = anonymousClientId(ctx);
  const date = todayStr();
  const existing = anonymousUsage.get(key);
  if (!existing || existing.date !== date) {
    return { key, usage: { date, count: 0, lastRequestAt: 0 } };
  }
  return { key, usage: existing };
}

function saveAnonymousUsage(key: string, usage: AnonymousUsage) {
  anonymousUsage.set(key, usage);
}

const QUANTUM_SYSTEM_PROMPT = `You are the Cubit Logic AI Tutor, an expert in quantum computing, quantum mechanics, and quantum artificial intelligence. You are embedded on CubitLogic.com, an educational website dedicated to making quantum intelligence accessible to everyone.

Your role is to explain quantum concepts clearly and accurately — accessible enough for a curious beginner, precise enough to satisfy a physicist. Always start with an intuitive explanation before introducing math or formalism. Use analogies when helpful. Never be condescending.

Topics you cover: qubits, superposition, quantum entanglement, quantum gates, quantum circuits, quantum algorithms (Shor's, Grover's, QFT), quantum error correction, decoherence, quantum machine learning, variational quantum eigensolvers, quantum advantage, and the current state of quantum hardware.

Keep responses concise but complete — aim for 2-4 paragraphs. Use Unicode notation for equations when helpful (e.g. |ψ⟩ = α|0⟩ + β|1⟩). If a question is outside quantum computing or AI, politely redirect to your area of expertise.`;

// Get today's date string in YYYY-MM-DD format
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export const newsletterRouter = router({
  subscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      try {
        await db.insert(newsletterSubscribers).values({ email: input.email });
        // Alert owner about new subscriber
        await alertOwner("New Newsletter Subscriber", `${input.email} just subscribed to the CubitLogic newsletter.`);
        return { success: true, message: "You're subscribed! Welcome to the Cubit Logic community." };
      } catch (err: any) {
        if (err?.code === "ER_DUP_ENTRY" || err?.message?.includes("duplicate")) {
          return { success: true, message: "You're already subscribed — we've got you on the list!" };
        }
        throw err;
      }
    }),
});

export const appRouter = router({
  system: systemRouter,
  news: newsRouter,
  newsletter: newsletterRouter,
  paypal: paypalRouter,
  notifications: notificationRouter,
  auth: router({
    me: publicProcedure.query((opts: { ctx: TrpcContext }) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }: { ctx: TrpcContext }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  ai: router({
    // Get current usage status for the logged-in user (or anonymous)
    usageStatus: publicProcedure.query(async ({ ctx }: { ctx: TrpcContext }) => {
      if (!ctx.user) {
        const { usage } = getAnonymousUsage(ctx);
        return {
          isPro: false,
          usedToday: usage.count,
          limit: FREE_DAILY_LIMIT,
          remaining: Math.max(0, FREE_DAILY_LIMIT - usage.count),
        };
      }
      const db = await getDb();
      if (!db) return { isPro: false, usedToday: 0, limit: FREE_DAILY_LIMIT, remaining: FREE_DAILY_LIMIT };

      const today = todayStr();
      const rows = await db.select().from(aiUsage)
        .where(and(eq(aiUsage.userId, ctx.user.id), eq(aiUsage.date, today)))
        .limit(1);
      const used = rows[0]?.count ?? 0;
      return { isPro: false, usedToday: used, limit: FREE_DAILY_LIMIT, remaining: Math.max(0, FREE_DAILY_LIMIT - used) };
    }),

    chat: publicProcedure
      .input(z.object({
        message: z.string().min(1).max(2000),
        history: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).max(20).optional().default([]),
      }))
      .mutation(async ({ input, ctx }: { input: { message: string; history: { role: "user" | "assistant"; content: string }[] }; ctx: TrpcContext }) => {
        const db = await getDb();

        // Enforce the same usage limit for every logged-in user. Recurring
        // donations do not buy additional access or change this limit.
        if (ctx.user && db) {
          const today = todayStr();
          const rows = await db.select().from(aiUsage)
            .where(and(eq(aiUsage.userId, ctx.user.id), eq(aiUsage.date, today)))
            .limit(1);
          const used = rows[0]?.count ?? 0;
          if (used >= FREE_DAILY_LIMIT) {
            return { reply: null, limitReached: true };
          }
          // Increment usage
          if (rows.length > 0) {
            await db.update(aiUsage)
              .set({ count: used + 1 })
              .where(and(eq(aiUsage.userId, ctx.user.id), eq(aiUsage.date, today)));
          } else {
            await db.insert(aiUsage).values({ userId: ctx.user.id, date: today, count: 1 });
          }
        }

        // Anonymous visitors are counted by a server-side limiter below.

        // Enforce an in-memory server-side limit for anonymous visitors so
        // clearing browser storage cannot bypass the Gemini free-tier guard.
        if (!ctx.user) {
          const { key, usage } = getAnonymousUsage(ctx);
          const now = Date.now();
          if (
            usage.count >= FREE_DAILY_LIMIT ||
            now - usage.lastRequestAt < ANONYMOUS_CHAT_COOLDOWN_MS
          ) {
            return { reply: null, limitReached: true };
          }
          saveAnonymousUsage(key, {
            ...usage,
            count: usage.count + 1,
            lastRequestAt: now,
          });
        }

        const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
          { role: "system", content: QUANTUM_SYSTEM_PROMPT },
          ...input.history.map((h) => ({ role: h.role, content: h.content })),
          { role: "user", content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const content = (response as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content ?? "I'm having trouble responding right now. Please try again.";
        return { reply: content, limitReached: false };
      }),
  }),

  subscription: router({
    // Keep the existing response shape for older clients. The legacy billing
    // status is informational only and never grants additional site access.
    status: protectedProcedure.query(async () => {
      return {
        isPro: false,
        status: "free" as const,
      };
    }),

    // Keep the existing mutation name for client compatibility, but create a
    // voluntary monthly donation checkout that is also available to guests.
    createCheckout: publicProcedure.mutation(async ({ ctx }: { ctx: TrpcContext }) => {
      if (!stripe) {
        throw new Error("Payments are not configured for this deployment");
      }
      const origin = (ctx.req.headers.origin as string) || "https://www.cubitlogic.com";
      const donorMetadata = {
        payment_purpose: "voluntary_monthly_donation",
        ...(ctx.user
          ? {
              user_id: ctx.user.id.toString(),
              customer_email: ctx.user.email || "",
              customer_name: ctx.user.name || "",
            }
          : {}),
      };

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        submit_type: "donate",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: 500,
              recurring: { interval: "month" },
              product_data: {
                name: "CubitLogic Monthly Donation",
                description:
                  "Voluntary monthly support for CubitLogic. This donation does not purchase membership or unlock paid features.",
              },
            },
            quantity: 1,
          },
        ],
        customer_email: ctx.user?.email ?? undefined,
        client_reference_id: ctx.user?.id.toString(),
        metadata: donorMetadata,
        subscription_data: { metadata: donorMetadata },
        custom_text: {
          submit: {
            message:
              "This is a voluntary monthly donation. CubitLogic content remains available regardless of whether you donate.",
          },
        },
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/support`,
      });

      return { url: session.url };
    }),

    // Preserve the billing portal so existing monthly donors can manage or
    // cancel their recurring contribution.
    createPortal: protectedProcedure.mutation(async ({ ctx }: { ctx: TrpcContext & { user: NonNullable<TrpcContext["user"]> } }) => {
      if (!stripe) {
        throw new Error("Payments are not configured for this deployment");
      }
      const origin = (ctx.req.headers.origin as string) || "https://www.cubitlogic.com";
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const userRows = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const stripeCustomerId = userRows[0]?.stripeCustomerId;
      if (!stripeCustomerId) throw new Error("No Stripe customer found");

      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${origin}/`,
      });

      return { url: session.url };
    }),
  }),
});

export type AppRouter = typeof appRouter;
