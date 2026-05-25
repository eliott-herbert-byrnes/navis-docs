import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrgPlan, StripeSubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

const mockOrgFindUnique = vi.fn();
const mockOrgUpdate = vi.fn();
const mockPriceRetrieve = vi.fn();
const mockSubscriptionRetrieve = vi.fn();
const mockSendEmail = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    organization: {
      findUnique: (...args: unknown[]) => mockOrgFindUnique(...args),
      update: (...args: unknown[]) => mockOrgUpdate(...args),
    },
  },
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    prices: {
      retrieve: (...args: unknown[]) => mockPriceRetrieve(...args),
    },
    subscriptions: {
      retrieve: (...args: unknown[]) => mockSubscriptionRetrieve(...args),
    },
  }),
}));

vi.mock("@/lib/resend", () => ({
  getResend: () => ({
    emails: { send: (...args: unknown[]) => mockSendEmail(...args) },
  }),
}));

vi.mock("@/lib/email", () => ({
  getEmailFrom: () => "test@example.com",
}));

vi.mock("@react-email/render", () => ({
  render: vi.fn().mockResolvedValue("<p>email</p>"),
}));

import {
  deleteStripeSubscription,
  handleInvoicePaymentFailed,
  updateStripeSubscription,
} from "@/app/api/stripe/data/crud-stripe";

describe("Stripe billing data handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrgUpdate.mockResolvedValue({});
    mockSendEmail.mockResolvedValue({ error: null });
    mockPriceRetrieve.mockResolvedValue({
      product: { metadata: { plan: "pro" } },
      metadata: {
        allowedProcedures: "100",
        allowedDepartments: "5",
        allowedTeamsPerDepartment: "3",
      },
    });
  });

  it("updateStripeSubscription syncs org plan and clears grace for active subs", async () => {
    mockOrgFindUnique.mockResolvedValue({ id: "org-1" });

    const subscription = {
      id: "sub_123",
      customer: "cus_123",
      status: StripeSubscriptionStatus.active,
      items: {
        data: [
          {
            price: { id: "price_pro" },
            current_period_end: 1_900_000_000,
          },
        ],
      },
    } as Stripe.Subscription;

    await updateStripeSubscription(subscription);

    expect(mockOrgUpdate).toHaveBeenCalledWith({
      where: { stripeCustomerId: "cus_123" },
      data: expect.objectContaining({
        stripeSubscriptionId: "sub_123",
        stripeSubscriptionStatus: StripeSubscriptionStatus.active,
        plan: OrgPlan.pro,
        billingGraceEndsAt: null,
        entitlementsJSON: expect.objectContaining({
          allowedProcedures: 100,
        }),
      }),
    });
  });

  it("handleInvoicePaymentFailed sets past_due and starts grace from active", async () => {
    mockOrgFindUnique.mockResolvedValue({
      stripeSubscriptionStatus: StripeSubscriptionStatus.active,
      billingGraceEndsAt: null,
    });

    await handleInvoicePaymentFailed({
      id: "in_1",
      customer: "cus_123",
      subscription: "sub_123",
    } as unknown as Stripe.Invoice);

    expect(mockOrgUpdate).toHaveBeenCalledWith({
      where: { stripeCustomerId: "cus_123" },
      data: expect.objectContaining({
        stripeSubscriptionStatus: StripeSubscriptionStatus.past_due,
        billingGraceEndsAt: expect.any(Date),
      }),
    });
  });

  it("deleteStripeSubscription downgrades org and emails owner", async () => {
    mockOrgFindUnique.mockResolvedValue({
      name: "Acme",
      ownerUser: { email: "owner@test.com", name: "Owner" },
    });

    await deleteStripeSubscription({
      id: "sub_123",
      customer: "cus_123",
    } as Stripe.Subscription);

    expect(mockOrgUpdate).toHaveBeenCalledWith({
      where: { stripeCustomerId: "cus_123" },
      data: expect.objectContaining({
        plan: OrgPlan.free,
        stripeSubscriptionId: null,
        stripeSubscriptionStatus: null,
      }),
    });
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "owner@test.com" }),
    );
  });
});
