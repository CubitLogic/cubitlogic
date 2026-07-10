import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import type { TrpcContext } from "./_core/context";
import { z } from "zod";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { createNotification, alertOwner } from "./notificationRouter";

const PAYPAL_BASE = "https://api-m.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PRO_PRICE_USD = "5.00";
const PRO_PLAN_NAME = "Cubit Logic Pro";

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

// Create or retrieve a PayPal subscription plan for $5/month
let cachedPlanId: string | null = null;

async function getOrCreatePlan(): Promise<string> {
  if (cachedPlanId) return cachedPlanId;

  // List existing plans to avoid duplicates
  const list = (await paypalRequest("GET", "/v1/billing/plans?page_size=20&status=ACTIVE")) as {
    plans?: { id: string; name: string }[];
  };
  const existing = list.plans?.find((p) => p.name === PRO_PLAN_NAME);
  if (existing) {
    cachedPlanId = existing.id;
    return existing.id;
  }

  // Create product first
  const product = (await paypalRequest("POST", "/v1/catalogs/products", {
    name: PRO_PLAN_NAME,
    type: "SERVICE",
    category: "EDUCATIONAL_AND_TEXTBOOKS",
  })) as { id: string };

  // Create billing plan
  const plan = (await paypalRequest("POST", "/v1/billing/plans", {
    product_id: product.id,
    name: PRO_PLAN_NAME,
    description: "Unlimited AI Tutor access, all Prompt Engineering modules, and more.",
    status: "ACTIVE",
    billing_cycles: [
      {
        frequency: { interval_unit: "MONTH", interval_count: 1 },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // 0 = infinite
        pricing_scheme: {
          fixed_price: { value: PRO_PRICE_USD, currency_code: "USD" },
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
  // Create a PayPal subscription and return the approval URL
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
          cancel_url: `${origin}/pricing`,
        },
        custom_id: ctx.user.id.toString(),
      })) as { id: string; links: { href: string; rel: string }[] };

      const approvalLink = subscription.links?.find((l) => l.rel === "approve")?.href;
      if (!approvalLink) throw new Error("PayPal did not return an approval URL");

      return { url: approvalLink, subscriptionId: subscription.id };
    }
  ),

  // Capture/activate a subscription after user approves
  captureSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(async ({ input, ctx }: { input: { subscriptionId: string }; ctx: TrpcContext & { user: NonNullable<TrpcContext["user"]> } }) => {
      // Verify subscription is active with PayPal
      const sub = (await paypalRequest("GET", `/v1/billing/subscriptions/${input.subscriptionId}`)) as {
        status: string;
        custom_id: string;
      };

      if (sub.status !== "ACTIVE" && sub.status !== "APPROVED") {
        throw new Error(`Subscription not active: ${sub.status}`);
      }

      // Verify this subscription belongs to this user
      if (sub.custom_id !== ctx.user.id.toString()) {
        throw new Error("Subscription does not belong to this user");
      }

      // Update user to Pro in DB
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(users)
        .set({
          subscriptionStatus: "pro",
          stripeSubscriptionId: `paypal:${input.subscriptionId}`, // store PayPal sub ID in same field
        })
        .where(eq(users.id, ctx.user.id));

      // Notify the user
      await createNotification({
        userId: ctx.user.id,
        title: "Welcome, Supporter!",
        message: "Thank you for supporting CubitLogic via PayPal! You now have unlimited AI Tutor access, the full Prompt Engineering course, and priority responses.",
        type: "subscription",
      });

      // Alert the owner
      const userName = ctx.user.name || ctx.user.email || `User #${ctx.user.id}`;
      await alertOwner("New Supporter!", `${userName} just became a CubitLogic supporter via PayPal ($5/month).`);

      return { success: true };
    }),

  // Webhook handler for PayPal subscription events (called from Express)
  // This is handled separately in the webhook route, not via tRPC
});
