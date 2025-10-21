import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export type EventCreateOrganization = {
  data: {
    orgId: string;
  };
};

export const eventCreateOrganization = inngest.createFunction(
  {
    id: "create-organization",
  },
  {
    event: "onboarding/create-organization",
  },
  async ({ event }) => {
    const { orgId } = event.data;

    const org = await prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      include: {
        ownerUser: true,
      },
    });

    const customer = await stripe.customers.create({
      email: org.ownerUser.email,
      name: org.name,
      metadata: { orgId: org.id, orgSlug: org.slug },
    });

    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeCustomerId: customer.id },
    });

    return { event, body: true };
  }
);
