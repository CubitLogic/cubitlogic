import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import {
  eventMatchesConfiguredMode,
  inferStripeLivemode,
  invoiceSubscriptionId,
  isActiveSupporterStatus,
  isCubitSupporterSubscription,
  normalizePublicAppUrl,
  parseStripeUserId,
  STRIPE_SUPPORT_PURPOSE,
} from "./stripeSupport";

function subscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    metadata: {
      payment_purpose: STRIPE_SUPPORT_PURPOSE,
      user_id: "42",
    },
    items: {
      data: [{ price: { id: "price_supporter" } }],
    },
    status: "active",
    ...overrides,
  } as unknown as Stripe.Subscription;
}

describe("Stripe supporter validation", () => {
  it("matches live and test secret keys to webhook mode", () => {
    expect(inferStripeLivemode("sk_live_example")).toBe(true);
    expect(inferStripeLivemode("rk_test_example")).toBe(false);
    expect(inferStripeLivemode("unknown")).toBeNull();
    expect(eventMatchesConfiguredMode({ livemode: true }, true)).toBe(true);
    expect(eventMatchesConfiguredMode({ livemode: false }, true)).toBe(false);
  });

  it("requires the exact Cubit Logic recurring price and purpose", () => {
    expect(isCubitSupporterSubscription(subscription(), "price_supporter")).toBe(true);
    expect(isCubitSupporterSubscription(subscription(), "price_other")).toBe(false);
    expect(isCubitSupporterSubscription(subscription({ metadata: {} }), "price_supporter")).toBe(false);
  });

  it("only treats paid active subscriptions as active supporter status", () => {
    expect(isActiveSupporterStatus("active")).toBe(true);
    expect(isActiveSupporterStatus("trialing")).toBe(false);
    expect(isActiveSupporterStatus("past_due")).toBe(false);
  });

  it("reads the current invoice parent subscription field", () => {
    const invoice = {
      parent: {
        type: "subscription_details",
        subscription_details: { subscription: "sub_123" },
      },
    } as unknown as Stripe.Invoice;
    expect(invoiceSubscriptionId(invoice)).toBe("sub_123");
  });

  it("normalizes only web application URLs and validates member IDs", () => {
    expect(normalizePublicAppUrl("https://cubitlogic.com/")).toBe("https://cubitlogic.com");
    expect(() => normalizePublicAppUrl("javascript:alert(1)")).toThrow();
    expect(parseStripeUserId("7")).toBe(7);
    expect(parseStripeUserId("0")).toBeNull();
    expect(parseStripeUserId("not-a-number")).toBeNull();
  });
});
