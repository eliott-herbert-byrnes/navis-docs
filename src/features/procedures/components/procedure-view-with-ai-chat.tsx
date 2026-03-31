"use client";

import { useRef, useState } from "react";
import { ProcedureViewActions } from "./procedure-view-actions";
import { ProcedureViewMetadata } from "./procedure-view-metadata";
import { ProcedureContent } from "./procedure-content";
import { ProcedureAuditLogList } from "@/features/audit/components/procedure-audit-log-list";
import { AIChatDrawer } from "@/features/ai/components/chat-drawer";
import { ProcedureForViewWithRelations } from "../types/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function buildAskAIMessage(procedureTitle: string): string {
  const name = procedureTitle?.trim() || "this procedure";
  return `Please can you read the '${name}' so I can ask you questions about it?`;
}

type ProcedureViewWithAIChatProps = {
  procedure: ProcedureForViewWithRelations;
  procedureId: string;
  canEdit: boolean;
  isFavorite: boolean;
  isRead: boolean;
  canViewProcedureAudit: boolean;
};

export function ProcedureViewWithAIChat({
  procedure,
  procedureId,
  canEdit,
  isFavorite,
  isRead,
  canViewProcedureAudit,
}: ProcedureViewWithAIChatProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<
    string | undefined
  >(undefined);
  const [showDocView, setShowDocView] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const auditScrollContainerRef = useRef<HTMLDivElement>(null);

  const handleAskAI = () => {
    const message = buildAskAIMessage(procedure.title ?? "");
    setInitialChatMessage(message);
    setIsChatOpen(true);
  };

  const handleChatOpenChange = (open: boolean) => {
    setIsChatOpen(open);
    if (!open) {
      setInitialChatMessage(undefined);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <ProcedureViewActions
            procedure={procedure}
            procedureId={procedureId}
            canEdit={canEdit}
            isFavorite={isFavorite}
            isRead={isRead}
            onAskAI={handleAskAI}
            showDocView={showDocView}
            onViewText={() => setShowDocView((prev) => !prev)}
            canViewProcedureAudit={canViewProcedureAudit}
            showAuditLogs={showAuditLogs}
            onViewAuditLogs={() => setShowAuditLogs((prev) => !prev)}
          />
      </div>

      {!showAuditLogs ? (
        <Suspense fallback={<Skeleton />}>
          <ProcedureContent
            procedure={procedure}
            showDocView={procedure.style === "FLOW" ? showDocView : undefined}
          />
        </Suspense>
      ) : (
        <div className="rounded-md border overflow-hidden flex flex-col min-h-[400px] max-h-[70vh] animate-fade-from-top">
          <div className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-muted/50 shrink-0">
            <span className="text-sm font-medium">Audit logs</span>
            <button
              type="button"
              onClick={() => setShowAuditLogs(false)}
              className="text-sm text-black hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            >
              Back to procedure
            </button>
          </div>
          <div
            ref={auditScrollContainerRef}
            className="flex-1 min-h-0 overflow-auto p-4"
          >
            <ProcedureAuditLogList
              procedureId={procedureId}
              enabled={showAuditLogs}
              scrollContainerRef={auditScrollContainerRef}
            />
          </div>
        </div>
      )}

      <Suspense fallback={<Skeleton />}>
        <AIChatDrawer
          open={isChatOpen}
          onOpenChange={handleChatOpenChange}
          initialMessage={initialChatMessage}
          onInitialMessageConsumed={() => setInitialChatMessage(undefined)}
        />
      </Suspense>
    </>
  );
}
