import type { Express, Request, Response } from "express";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { stripeWebhookEvents, users } from "../drizzle/schema";
import { createNotification, alertOwner } from "./notificationRouter";
import {
  createStripeClient,
  eventMatchesConfiguredMode,
  expandableId,
  invoiceSubscriptionId,
  isActiveSupporterStatus,
  isCubitSupporterSubscription,
  parseStripeUserId,
  readStripeRuntimeConfig,
  STRIPE_SUPPORT_PURPOSE,
  supporterUserId,
} from "./stripeSupport";

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

function isDuplicateEntry(error: unknown): boolean {
  const candidate = error as { code?: string; message?: string };
  return candidate?.code === "ER_DUP_ENTRY" || Boolean(candidate?.message?.toLowerCase().includes("duplicate"));
}

async function reserveEvent(db: Db, event: Stripe.Event): Promise<boolean> {
  try {
    await db.insert(stripeWebhookEvents).values({
      eventId: event.id,
      eventType: event.type,
      livemode: event.livemode ? 1 : 0,
      status: "processing",
    });
    return true;
  } catch (error) {
    if (isDuplicateEntry(error)) return false;
    throw error;
  }
}

async function markEventProcessed(db: Db, eventId: string): Promise<void> {
  await db.update(stripeWebhookEvents)
    .set({ status: "processed", processedAt: new Date() })
    .where(eq(stripeWebhookEvents.eventId, eventId));
}

async function releaseEvent(db: Db, eventId: string): Promise<void> {
  await db.delete(stripeWebhookEvents).where(eq(stripeWebhookEvents.eventId, eventId));
}

async function loadVerifiedSubscription(
  stripe: Stripe,
  subscriptionId: string,
  expectedPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (!isCubitSupporterSubscription(subscription, expectedPriceId)) {
    throw new Error("Stripe subscription does not match the configured Cubit Logic supporter price and purpose");
  }
  return subscription;
}

async function setSupporterStatus(
  db: Db,
  subscription: Stripe.Subscription,
  active: boolean,
  source: string
): Promise<void> {
  const userId = supporterUserId(subscription);
  const customerId = expandableId(subscription.customer);
  if (!userId || !customerId) {
    throw new Error("Verified Stripe subscription is missing its linked Cubit Logic member or customer");
  }

  const existingRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const existing = existingRows[0];
  if (!existing) throw new Error(`Linked Cubit Logic member ${userId} was not found`);

  const nextStatus = active ? "pro" : "free";
  const changed = existing.subscriptionStatus !== nextStatus;

  await db.update(users)
    .set({
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: nextStatus,
    })
    .where(eq(users.id, userId));

  console.log(`[Webhook] Member ${userId} supporter status: ${nextStatus} (${source})`);

  if (!changed) return;

  if (active) {
    await createNotification({
      userId,
      title: "Supporter Access Is Active",
      message: "Thank you for supporting CubitLogic. Your account now has active supporter status and enhanced Qubit AI access while your recurring support remains active.",
      type: "subscription",
    });
    const supporterName = existing.name || existing.email || `Member #${userId}`;
    await alertOwner("New Active Supporter", `${supporterName} completed a verified recurring Stripe contribution and supporter access is now active.`);
  } else {
    await createNotification({
      userId,
      title: "Supporter Status Updated",
      message: "Your recurring Stripe support is no longer active, so your account has returned to standard access. Public Cubit Logic learning content remains available.",
      type: "subscription",
    });
  }
}

export function registerStripeWebhook(app: Express) {
  let config: ReturnType<typeof readStripeRuntimeConfig>;
  let stripe: Stripe;

  try {
    config = readStripeRuntimeConfig({ requireWebhook: true });
    stripe = createStripeClient(config.secretKey);
  } catch (error) {
    console.warn("[Webhook] Stripe webhook is not configured:", error instanceof Error ? error.message : error);
    app.post("/api/stripe/webhook", (_req: Request, res: Response) => {
      res.status(503).send("Stripe webhook is not configured for this deployment");
    });
    return;
  }

  // express.raw({ type: "application/json" }) is registered before express.json().
  app.post("/api/stripe/webhook", async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];
    let event: Stripe.Event;

    try {
      if (typeof signature !== "string" || !signature) throw new Error("Missing Stripe signature");
      event = stripe.webhooks.constructEvent(req.body, signature, config.webhookSecret);
      if (!eventMatchesConfiguredMode(event, config.expectedLivemode)) {
        throw new Error("Stripe event live/test mode does not match the configured secret key");
      }
    } catch (error) {
      console.error("[Webhook] Verification failed:", error);
      res.status(400).send("Stripe webhook verification failed");
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(500).send("Database unavailable");
      return;
    }

    let reserved = false;
    try {
      reserved = await reserveEvent(db, event);
      if (!reserved) {
        res.json({ received: true, duplicate: true });
        return;
      }

      console.log(`[Webhook] Event: ${event.type} (${event.id}, livemode=${event.livemode})`);

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.mode !== "subscription" || session.metadata?.payment_purpose !== STRIPE_SUPPORT_PURPOSE) {
            throw new Error("Checkout session is not a Cubit Logic recurring supporter session");
          }

          const userId = parseStripeUserId(session.metadata?.user_id);
          const customerId = expandableId(session.customer);
          const subscriptionId = expandableId(session.subscription);
          if (!userId || !customerId || !subscriptionId) {
            throw new Error("Checkout session is missing its linked member, customer, or subscription");
          }

          const subscription = await loadVerifiedSubscription(stripe, subscriptionId, config.priceId);
          if (supporterUserId(subscription) !== userId) {
            throw new Error("Checkout and subscription member metadata do not match");
          }

          // Checkout completion links the Stripe records but does not grant access.
          // Supporter status is granted only after a paid invoice or active verified subscription.
          await db.update(users)
            .set({ stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId })
            .where(eq(users.id, userId));
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          const subscriptionId = invoiceSubscriptionId(invoice);
          if (!invoice.paid || invoice.amount_paid <= 0 || !subscriptionId) {
            console.log(`[Webhook] Ignoring non-contribution invoice ${invoice.id}`);
            break;
          }

          const subscription = await loadVerifiedSubscription(stripe, subscriptionId, config.priceId);
          if (isActiveSupporterStatus(subscription.status)) {
            await setSupporterStatus(db, subscription, true, "invoice.paid");
          }
          break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          if (!isCubitSupporterSubscription(subscription, config.priceId)) {
            console.log(`[Webhook] Ignoring unrelated subscription ${subscription.id}`);
            break;
          }
          const active = event.type !== "customer.subscription.deleted" && isActiveSupporterStatus(subscription.status);
          await setSupporterStatus(db, subscription, active, event.type);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const subscriptionId = invoiceSubscriptionId(invoice);
          if (!subscriptionId) break;

          const subscription = await loadVerifiedSubscription(stripe, subscriptionId, config.priceId);
          await setSupporterStatus(db, subscription, false, "invoice.payment_failed");
          const customerId = expandableId(subscription.customer) ?? "unknown";
          await alertOwner("Stripe Contribution Payment Failed", `A verified Cubit Logic supporter payment failed for Stripe customer ${customerId}.`);
          break;
        }

        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }

      await markEventProcessed(db, event.id);
      res.json({ received: true });
    } catch (error) {
      if (reserved) {
        try {
          await releaseEvent(db, event.id);
        } catch (releaseError) {
          console.error("[Webhook] Could not release failed event reservation:", releaseError);
        }
      }
      console.error("[Webhook] Processing error:", error);
      res.status(500).send("Webhook processing failed");
    }
  });
}
