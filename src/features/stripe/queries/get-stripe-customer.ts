"use server";
import { prisma } from "@/lib/prisma";

export const getStripeCustomerByOrg = async (orgSlug: string) => {
  if (!orgSlug) {
    return null;
  }

  return await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
};
