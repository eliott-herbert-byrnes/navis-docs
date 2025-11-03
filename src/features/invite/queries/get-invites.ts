import { prisma } from "@/lib/prisma";

type GetInvitesParams = {
  orgId: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export const getInvites = async ({
  orgId,
  search,
  page = 1,
  pageSize = 10,
}: GetInvitesParams) => {
  const skip = (page - 1) * pageSize;

  const where = {
    orgId: orgId,
    ...(search && {
      email: {
        contains: search,
        mode: "insensitive" as const,
      },
    }),
  };

  const [invites, total] = await Promise.all([
    prisma.invitation.findMany({
      where,
      select: {
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        invitedByUserId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    }),
    prisma.invitation.count({ where }),
  ]);

  return {
    invites,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
