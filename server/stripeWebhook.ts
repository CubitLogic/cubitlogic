import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { createNotification, alertOwner } from "./notificationRouter";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2026-06-24.dahlia" })
  : null;

export function registerStripeWebhook(app: Express) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    console.warn("[Webhook] Stripe webhook is not configured; webhook processing is disabled");
    app.post("/api/stripe/webhook", (_req: Request, res: Response) => {
      res.status(503).send("Stripe webhook is not configured for this deployment");
    });
    return;
  }

  // NOTE: express.raw({ type: 'application/json' }) is registered in index.ts BEFORE express.json()
  // so req.body here is a Buffer for this route
  app.post("/api/stripe/webhook", async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      if (!sig) throw new Error("Missing Stripe signature");
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err);
      res.status(400).send("Webhook signature verification failed");
      return;
    }

    if (!event || !event.type) {
      res.status(400).send("Invalid event payload");
      return;
    }

    // Handle test events (Stripe test mode event IDs start with evt_test_)
    if (event.id?.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected, returning verification response");
      res.json({ verified: true });
      return;
    }

    console.log(`[Webhook] Event: ${event.type} (${event.id})`);

    const db = await getDb();
    if (!db) {
      console.error("[Webhook] Database unavailable");
      res.status(500).send("Database unavailable");
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.user_id;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          if (userId) {
            const parsedUserId = Number.parseInt(userId, 10);
            if (!Number.isInteger(parsedUserId)) {
              throw new Error("Stripe checkout metadata contains an invalid user ID");
            }
            await db.update(users)
              .set({
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                subscriptionStatus: "pro",
              })
              .where(eq(users.id, parsedUserId));
            console.log(`[Webhook] Activated supporter status for user ${userId}`);

            await createNotification({
              userId: parsedUserId,
              title: "Supporter Access Is Active",
              message: "Thank you for supporting CubitLogic. Your account now has active supporter status and enhanced Qubit AI access while your recurring support remains active.",
              type: "subscription",
            });
          }

          // Alert the owner for both signed-in and anonymous donations.
          const donorName = session.metadata?.customer_name
            || session.metadata?.customer_email
            || session.customer_details?.name
            || session.customer_details?.email
            || session.customer_email
            || (userId ? `User #${userId}` : "An anonymous donor");
          await alertOwner("New Monthly Donation", `${donorName} started a voluntary CubitLogic donation via Stripe ($5/month).`);
          break;
        }

        case "customer.subscription.deleted":
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const isActive = subscription.status === "active" || subscription.status === "trialing";
          await db.update(users)
            .set({ subscriptionStatus: isActive ? "pro" : "free" })
            .where(eq(users.stripeCustomerId, customerId));
          console.log(`[Webhook] Customer ${customerId} recurring donation status: ${isActive ? "active" : subscription.status}`);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;

          const failedUserRows = await db.select().from(users)
            .where(eq(users.stripeCustomerId, customerId))
            .limit(1);
          console.log(`[Webhook] Monthly donation payment failed for customer ${customerId}`);

          // Notify the user about payment failure
          if (failedUserRows.length > 0) {
            await createNotification({
              userId: failedUserRows[0].id,
              title: "Donation Payment Issue",
              message: "We couldn't process your monthly support payment. Please update your payment method to keep supporter status active. Core CubitLogic learning content remains available.",
              type: "subscription",
            });
          }

          // Alert owner
          await alertOwner("Donation Payment Failed", `Customer ${customerId}'s voluntary monthly donation payment failed.`);
          break;
        }

        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error("[Webhook] Processing error:", err);
      res.status(500).send("Webhook processing failed");
    }
  });
}
