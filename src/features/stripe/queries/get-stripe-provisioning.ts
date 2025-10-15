import { prisma } from "@/lib/prisma";

export const getStripeProvisionByOrg = async (orgSlug: string) => {
  if (!orgSlug) {
    return {
      allowedProcesses: 0,
      allowedDepartments: 0,
      allowedTeamsPerDepartment: 0,
    };
  }

  const [allowedProcesses, allowedDepartments, allowedTeamsPerDepartment, stripeCustomer] =
    await prisma.$transaction([
      prisma.organization.count({
        where: {
          slug: orgSlug,
        },
      }),
      prisma.department.count({
        where: {
          org: {
            slug: orgSlug,
          },
        },
      }),
      prisma.team.count({
        where: {
          department: {
            org: {
              slug: orgSlug,
            },
          },
        },
      }),
      prisma.organization.findUnique({
        where: {
          slug: orgSlug,
        },
        select: {
          stripeSubscriptionStatus: true,
        },
      }),
    ]);

  // Determine the maximum value among allowedProcesses, allowedDepartments, and allowedTeamsPerDepartment
  const currentProvisioning = Math.max(
    allowedProcesses,
    allowedDepartments,
    allowedTeamsPerDepartment
  );
  const isActive = stripeCustomer?.stripeSubscriptionStatus === "active";

  return {
    currentProvisioning,
    isActive,
  };
};
