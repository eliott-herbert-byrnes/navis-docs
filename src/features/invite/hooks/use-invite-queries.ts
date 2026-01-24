"use client";

import { trpc } from "@/trpc/client";

export function useGetInvites(
  orgId: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
) {
  return trpc.invites.getInvites.useQuery(
    {
      orgId,
      search,
      page,
      pageSize,
    },
    {
      enabled: !!orgId,
    },
  );
}
