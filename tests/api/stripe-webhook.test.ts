import { beforeEach, describe, expect, it, vi } from "vitest";
import Stripe from "stripe";

const mockConstructEvent = vi.fn();
const mockUpdateStripeSubscription = vi.fn();
const mockDeleteStripeSubscription = vi.fn();
const mockSendTrialWillEndEmail = vi.fn();
const mockHandleInvoicePaymentFailed = vi.fn();
const mockHandleInvoicePaid = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    },
  }),
}));

vi.mock("@/app/api/stripe/data", () => ({
  updateStripeSubscription: (...args: unknown[]) =>
    mockUpdateStripeSubscription(...args),
  deleteStripeSubscription: (...args: unknown[]) =>
    mockDeleteStripeSubscription(...args),
  sendTrialWillEndEmail: (...args: unknown[]) =>
    mockSendTrialWillEndEmail(...args),
  handleInvoicePaymentFailed: (...args: unknown[]) =>
    mockHandleInvoicePaymentFailed(...args),
  handleInvoicePaid: (...args: unknown[]) => mockHandleInvoicePaid(...args),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: (name: string) =>
      name.toLowerCase() === "stripe-signature" ? "sig_test" : null,
  }),
}));

import { POST } from "@/app/api/stripe/route";

describe("POST /api/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    mockUpdateStripeSubscription.mockResolvedValue(undefined);
    mockDeleteStripeSubscription.mockResolvedValue(undefined);
    mockSendTrialWillEndEmail.mockResolvedValue(undefined);
    mockHandleInvoicePaymentFailed.mockResolvedValue(undefined);
    mockHandleInvoicePaid.mockResolvedValue(undefined);
  });

  it("returns 500 when webhook secret is missing", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const response = await POST(
      new Request("http://localhost/api/stripe", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 400 for invalid signatures", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Stripe.errors.StripeSignatureVerificationError({
        type: "invalid_request_error",
      });
    });

    const response = await POST(
      new Request("http://localhost/api/stripe", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(response.status).toBe(400);
  });

  it("handles subscription lifecycle events", async () => {
    const subscription = { id: "sub_123" } as Stripe.Subscription;

    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: { object: subscription },
    });

    const response = await POST(
      new Request("http://localhost/api/stripe", {
        method: "POST",
        body: JSON.stringify({ id: "evt_1" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockUpdateStripeSubscription).toHaveBeenCalledWith(subscription);
  });

  it("handles invoice payment events", async () => {
    const invoice = { id: "in_123" } as Stripe.Invoice;

    mockConstructEvent.mockReturnValueOnce({
      type: "invoice.payment_failed",
      data: { object: invoice },
    });

    const failed = await POST(
      new Request("http://localhost/api/stripe", {
        method: "POST",
        body: JSON.stringify({ id: "evt_failed" }),
      }),
    );
    expect(failed.status).toBe(200);
    expect(mockHandleInvoicePaymentFailed).toHaveBeenCalledWith(invoice);

    mockConstructEvent.mockReturnValueOnce({
      type: "invoice.paid",
      data: { object: invoice },
    });

    const paid = await POST(
      new Request("http://localhost/api/stripe", {
        method: "POST",
        body: JSON.stringify({ id: "evt_paid" }),
      }),
    );
    expect(paid.status).toBe(200);
    expect(mockHandleInvoicePaid).toHaveBeenCalledWith(invoice);
  });

  it("returns 500 when a handler throws", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_del" } },
    });
    mockDeleteStripeSubscription.mockRejectedValue(new Error("db down"));

    const response = await POST(
      new Request("http://localhost/api/stripe", {
        method: "POST",
        body: JSON.stringify({ id: "evt_del" }),
      }),
    );

    expect(response.status).toBe(500);
  });
});
