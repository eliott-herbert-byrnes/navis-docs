"use client";

import { useRef, useEffect } from "react";
import { format } from "date-fns";
import { trpc } from "@/trpc/client";
import { AuditLogCard } from "./audit-log-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditLogWithActorName } from "../utils/audit";

const PAGE_SIZE = 20;

function DateSeparator({ date }: { date: string }) {
  const dateObj = new Date(date);
  return (
    <div className="flex items-center gap-4 my-6 pt-3 first:mt-0">
      <div className="flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground">
          {format(dateObj, "MMMM dd, yyyy")}
        </h3>
      </div>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

type ProcedureAuditLogListProps = {
  procedureId: string;
  enabled?: boolean;
  className?: string;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
};

function ProcedureAuditLogListSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, dateIndex) => (
          <div key={`audit-skeleton-date-${dateIndex}`}>
            <div className="flex items-center gap-4 my-6 pt-3 first:mt-0">
              <Skeleton className="h-4 w-36" />
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, rowIndex) => (
                <div
                  key={`audit-skeleton-row-${dateIndex}-${rowIndex}`}
                  className="rounded-lg border p-4"
                >
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="mt-3 h-4 w-5/6" />
                  <Skeleton className="mt-2 h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProcedureAuditLogList({
  procedureId,
  enabled = true,
  className,
  scrollContainerRef,
}: ProcedureAuditLogListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    trpc.procedures.getProcedureAuditLogs.useInfiniteQuery(
      { procedureId, limit: PAGE_SIZE },
      {
        enabled,
        initialPageParam: 0,
        getNextPageParam: (lastPage) =>
          lastPage.hasMore ? lastPage.nextOffset : undefined,
      },
    );

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = sentinelRef.current;
    const root = scrollContainerRef?.current ?? null;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { root: root ?? undefined, rootMargin: "100px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, scrollContainerRef]);

  const allLogs: AuditLogWithActorName[] =
    data?.pages.flatMap((p) => p.logs) ?? [];

  if (isLoading) {
    return <ProcedureAuditLogListSkeleton className={className} />;
  }

  if (allLogs.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          title="No audit logs found"
          body="There are no audit logs for this procedure yet."
        />
      </div>
    );
  }

  const groupedByDate = allLogs.reduce(
    (acc, log) => {
      const key = format(new Date(log.at), "yyyy-MM-dd");
      if (!acc[key]) acc[key] = [];
      acc[key].push(log);
      return acc;
    },
    {} as Record<string, AuditLogWithActorName[]>,
  );
  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <div className={className}>
      <div className="space-y-2">
        {sortedDates.map((dateKey) => (
          <div key={dateKey}>
            <DateSeparator date={dateKey} />
            <div className="space-y-3">
              {groupedByDate[dateKey].map((log) => (
                <AuditLogCard
                  key={log.id}
                  log={log as Parameters<typeof AuditLogCard>[0]["log"]}
                  userName={log.actorName}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div ref={sentinelRef} className="h-4" aria-hidden />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Skeleton className="h-8 w-32" />
        </div>
      )}
    </div>
  );
}
