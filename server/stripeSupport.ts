import Stripe from "stripe";

export const STRIPE_API_VERSION = "2026-06-24.dahlia" as const;
export const STRIPE_SUPPORT_PURPOSE = "voluntary_monthly_donation";
export const DEFAULT_PUBLIC_APP_URL = "https://cubitlogic.com";

export type StripeRuntimeConfig = {
  secretKey: string;
  webhookSecret: string;
  priceId: string;
  publicAppUrl: string;
  expectedLivemode: boolean | null;
};

function trimmed(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function inferStripeLivemode(secretKey: string): boolean | null {
  if (/^(sk|rk)_live_/.test(secretKey)) return true;
  if (/^(sk|rk)_test_/.test(secretKey)) return false;
  return null;
}

export function normalizePublicAppUrl(value: string | undefined): string {
  const raw = trimmed(value) || DEFAULT_PUBLIC_APP_URL;
  const parsed = new URL(raw);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("APP_BASE_URL must use http or https");
  }
  return parsed.toString().replace(/\/$/, "");
}

export function readStripeRuntimeConfig(options: { requireWebhook?: boolean } = {}): StripeRuntimeConfig {
  const secretKey = trimmed(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = trimmed(process.env.STRIPE_WEBHOOK_SECRET);
  const priceId = trimmed(process.env.STRIPE_PRICE_ID);

  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured");
  if (options.requireWebhook && !webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  if (!priceId || !priceId.startsWith("price_")) {
    throw new Error("STRIPE_PRICE_ID must be the recurring Cubit Logic supporter price");
  }

  return {
    secretKey,
    webhookSecret,
    priceId,
    publicAppUrl: normalizePublicAppUrl(process.env.APP_BASE_URL),
    expectedLivemode: inferStripeLivemode(secretKey),
  };
}

export function createStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
}

export function expandableId(value: string | { id: string } | null | undefined): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value.id === "string") return value.id;
  return null;
}

export function parseStripeUserId(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function eventMatchesConfiguredMode(event: Pick<Stripe.Event, "livemode">, expected: boolean | null): boolean {
  return expected === null || event.livemode === expected;
}

export function isCubitSupporterSubscription(
  subscription: Pick<Stripe.Subscription, "metadata" | "items">,
  expectedPriceId: string
): boolean {
  if (subscription.metadata?.payment_purpose !== STRIPE_SUPPORT_PURPOSE) return false;
  const items = subscription.items?.data ?? [];
  return items.length === 1 && items[0]?.price?.id === expectedPriceId;
}

export function isActiveSupporterStatus(status: Stripe.Subscription["status"]): boolean {
  return status === "active";
}

export function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent;
  if (parent?.type !== "subscription_details") return null;
  return expandableId(parent.subscription_details?.subscription);
}

export function supporterUserId(subscription: Pick<Stripe.Subscription, "metadata">): number | null {
  return parseStripeUserId(subscription.metadata?.user_id);
}
