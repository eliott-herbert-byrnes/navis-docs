import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  const result = await prisma.organization.updateMany({
    data: {
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: null,
      currentPeriodEnd: null,
      billingGraceEndsAt: null,
    },
  });

  console.log(
    `Cleared Stripe billing fields on ${result.count} organization(s).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
