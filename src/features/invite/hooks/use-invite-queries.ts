"use client";

import { trpc } from "@/trpc/client";

export function useGetInvites(
  search?: string,
  page: number = 1,
  pageSize: number = 10,
) {
  return trpc.invites.getInvites.useQuery({
    search,
    page,
    pageSize,
  });
}
