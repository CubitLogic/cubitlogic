import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import {
  createStripeClient,
  readStripeRuntimeConfig,
  STRIPE_SUPPORT_PURPOSE,
} from "./stripeSupport";

type AuthenticatedContext = TrpcContext & { user: NonNullable<TrpcContext["user"]> };

async function paymentRuntime() {
  try {
    const config = readStripeRuntimeConfig();
    const stripe = createStripeClient(config.secretKey);
    const price = await stripe.prices.retrieve(config.priceId);
    if (!price.active || price.type !== "recurring" || !price.recurring) {
      throw new Error("STRIPE_PRICE_ID is not an active recurring price");
    }
    return { config, stripe };
  } catch (error) {
    console.error("[Stripe] Payment configuration error:", error);
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Recurring support payments are temporarily unavailable.",
    });
  }
}

export const stripeRouter = router({
  status: protectedProcedure.query(async ({ ctx }: { ctx: AuthenticatedContext }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const rows = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const status = rows[0]?.subscriptionStatus ?? "free";
    return {
      isPro: status === "pro",
      isSupporter: status === "pro",
      status,
    };
  }),

  createCheckout: protectedProcedure.mutation(async ({ ctx }: { ctx: AuthenticatedContext }) => {
    const { config, stripe } = await paymentRuntime();
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const rows = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const member = rows[0];
    if (!member) throw new TRPCError({ code: "NOT_FOUND", message: "Member account not found" });
    if (member.subscriptionStatus === "pro") {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Your supporter status is already active. Use account billing to manage it.",
      });
    }

    const donorMetadata = {
      payment_purpose: STRIPE_SUPPORT_PURPOSE,
      user_id: member.id.toString(),
      customer_email: member.email || "",
      customer_name: member.name || "",
      expected_price_id: config.priceId,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      submit_type: "donate",
      payment_method_types: ["card"],
      line_items: [{ price: config.priceId, quantity: 1 }],
      ...(member.stripeCustomerId
        ? { customer: member.stripeCustomerId }
        : { customer_email: member.email ?? undefined }),
      client_reference_id: member.id.toString(),
      metadata: donorMetadata,
      subscription_data: { metadata: donorMetadata },
      custom_text: {
        submit: {
          message:
            "This is voluntary recurring support. Core Cubit Logic learning content remains available whether or not you contribute.",
        },
      },
      success_url: `${config.publicAppUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.publicAppUrl}/support`,
    });

    if (!session.url) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe Checkout did not return a secure payment URL" });
    }
    return { url: session.url };
  }),

  createPortal: protectedProcedure.mutation(async ({ ctx }: { ctx: AuthenticatedContext }) => {
    const { config, stripe } = await paymentRuntime();
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const rows = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const customerId = rows[0]?.stripeCustomerId;
    if (!customerId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No linked Stripe supporter account was found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${config.publicAppUrl}/account`,
    });

    return { url: session.url };
  }),
});
