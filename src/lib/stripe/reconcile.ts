import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const MIN_AGE_MS = 30 * 60 * 1000;

export async function reconcileStripeCustomers({
  dryRun = true,
}: { dryRun?: boolean } = {}) {
  const stripe = getStripe();
  const results = {
    scanned: 0,
    orphans: [] as Array<{ id: string; orgId?: string }>,
    deleted: 0,
    errors: [] as string[],
  };

  for await (const customer of stripe.customers.list({ limit: 100 })) {
    results.scanned++;
    if (customer.deleted) continue;
    const orgId = (customer.metadata as Record<string, string> | null)?.orgId;
    if (!orgId) continue;
    const createdAt = customer.created * 1000;
    if (Date.now() - createdAt < MIN_AGE_MS) continue;

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true },
    });
    if (org) continue;

    results.orphans.push({ id: customer.id, orgId });
    if (!dryRun) {
      try {
        await stripe.customers.del(customer.id);
        results.deleted++;
      } catch (e) {
        results.errors.push(`${customer.id}: ${String(e)}`);
      }
    }
  }
  return results;
}
