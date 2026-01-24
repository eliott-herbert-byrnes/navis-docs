"use client";

import { trpc } from "@/trpc/client";

export function useSearchChunks(
  query: string,
  teamId: string,
  limit: number = 5,
) {
  return trpc.ai.searchChunks.useQuery(
    {
      query,
      teamId,
      limit,
    },
    {
      enabled: query.length > 0 && teamId.length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );
}
