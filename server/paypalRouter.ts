import { protectedProcedure, router } from "./_core/trpc";
import type { TrpcContext } from "./_core/context";
import { z } from "zod";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { createNotification, alertOwner } from "./notificationRouter";

const PAYPAL_BASE = "https://api-m.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const MONTHLY_DONATION_USD = "5.00";
const MONTHLY_DONATION_PLAN_NAME = "CubitLogic Monthly Donation";

// Cache access token to avoid re-fetching on every request
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getPayPalToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

async function paypalRequest(method: string, path: string, body?: object) {
  const token = await getPayPalToken();
  const res = await fetch(`${PAYPAL_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// Create or retrieve a recurring PayPal donation plan for $5/month.
let cachedPlanId: string | null = null;

async function getOrCreatePlan(): Promise<string> {
  if (cachedPlanId) return cachedPlanId;

  // List existing plans to avoid duplicates
  const list = (await paypalRequest("GET", "/v1/billing/plans?page_size=20&status=ACTIVE")) as {
    plans?: { id: string; name: string }[];
  };
  const existing = list.plans?.find((p) => p.name === MONTHLY_DONATION_PLAN_NAME);
  if (existing) {
    cachedPlanId = existing.id;
    return existing.id;
  }

  // Create product first
  const product = (await paypalRequest("POST", "/v1/catalogs/products", {
    name: MONTHLY_DONATION_PLAN_NAME,
    description: "Voluntary monthly support for CubitLogic with enhanced supporter account tools.",
    type: "SERVICE",
    category: "EDUCATIONAL_AND_TEXTBOOKS",
  })) as { id: string };

  // Create billing plan
  const plan = (await paypalRequest("POST", "/v1/billing/plans", {
    product_id: product.id,
    name: MONTHLY_DONATION_PLAN_NAME,
    description: "Voluntary monthly support for CubitLogic. Public learning content remains free.",
    status: "ACTIVE",
    billing_cycles: [
      {
        frequency: { interval_unit: "MONTH", interval_count: 1 },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // 0 = infinite
        pricing_scheme: {
          fixed_price: { value: MONTHLY_DONATION_USD, currency_code: "USD" },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: "CONTINUE",
      payment_failure_threshold: 3,
    },
  })) as { id: string };

  cachedPlanId = plan.id;
  return plan.id;
}

export const paypalRouter = router({
  // Keep the existing API name for compatibility while creating a voluntary
  // monthly donation through PayPal's recurring-billing infrastructure.
  createSubscription: protectedProcedure.mutation(
    async ({ ctx }: { ctx: TrpcContext & { user: NonNullable<TrpcContext["user"]> } }) => {
      const origin = (ctx.req.headers.origin as string) || "https://www.cubitlogic.com";
      const planId = await getOrCreatePlan();

      const subscription = (await paypalRequest("POST", "/v1/billing/subscriptions", {
        plan_id: planId,
        subscriber: {
          email_address: ctx.user.email || undefined,
          name: ctx.user.name ? { given_name: ctx.user.name.split(" ")[0], surname: ctx.user.name.split(" ").slice(1).join(" ") || "" } : undefined,
        },
        application_context: {
          brand_name: "Cubit Logic",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${origin}/success?payment=paypal`,
          cancel_url: `${origin}/support`,
        },
        custom_id: ctx.user.id.toString(),
      })) as { id: string; links: { href: string; rel: string }[] };

      const approvalLink = subscription.links?.find((l) => l.rel === "approve")?.href;
      if (!approvalLink) throw new Error("PayPal did not return an approval URL");

      return { url: approvalLink, subscriptionId: subscription.id };
    }
  ),

  // Confirm the recurring donation after the donor approves it.
  captureSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(async ({ input, ctx }: { input: { subscriptionId: string }; ctx: TrpcContext & { user: NonNullable<TrpcContext["user"]> } }) => {
      // Verify subscription is active with PayPal
      const sub = (await paypalRequest("GET", `/v1/billing/subscriptions/${input.subscriptionId}`)) as {
        status: string;
        custom_id: string;
      };

      if (sub.status !== "ACTIVE" && sub.status !== "APPROVED") {
        throw new Error(`Recurring donation not active: ${sub.status}`);
      }

      // Verify this subscription belongs to this user
      if (sub.custom_id !== ctx.user.id.toString()) {
        throw new Error("Recurring donation does not belong to this user");
      }

      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const existingRows = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const billingId = `paypal:${input.subscriptionId}`;
      const alreadyActive =
        existingRows[0]?.stripeSubscriptionId === billingId &&
        existingRows[0]?.subscriptionStatus === "pro";

      await db.update(users)
        .set({
          stripeSubscriptionId: billingId,
          subscriptionStatus: "pro",
        })
        .where(eq(users.id, ctx.user.id));

      if (!alreadyActive) {
        await createNotification({
          userId: ctx.user.id,
          title: "Supporter Access Is Active",
          message: "Thank you for supporting CubitLogic through PayPal. Your account now has active supporter status and enhanced Qubit AI access.",
          type: "subscription",
        });

        const userName = ctx.user.name || ctx.user.email || `User #${ctx.user.id}`;
        await alertOwner("New Monthly Donation", `${userName} started a voluntary CubitLogic donation via PayPal ($5/month).`);
      }

      return { success: true, supporterActive: true };
    }),

  // Webhook handler for PayPal recurring-donation events (called from Express)
  // This is handled separately in the webhook route, not via tRPC
});
