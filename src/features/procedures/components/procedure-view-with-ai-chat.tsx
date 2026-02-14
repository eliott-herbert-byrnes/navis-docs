"use client";

import { useState } from "react";
import { ProcedureViewActions } from "./procedure-view-actions";
import { ProcedureViewMetadata } from "./procedure-view-metadata";
import { ProcedureContent } from "./procedure-content";
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
};

export function ProcedureViewWithAIChat({
  procedure,
  procedureId,
  canEdit,
  isFavorite,
}: ProcedureViewWithAIChatProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<
    string | undefined
  >(undefined);
  const [showDocView, setShowDocView] = useState(false);

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
        <div className="procedure-view-actions" data-print-hide>
          <ProcedureViewActions
            procedure={procedure}
            procedureId={procedureId}
            canEdit={canEdit}
            isFavorite={isFavorite}
            onAskAI={handleAskAI}
            showDocView={showDocView}
            onViewText={() => setShowDocView((prev) => !prev)}
          />
        </div>
      </div>

      <ProcedureViewMetadata procedure={procedure} />

      <Suspense fallback={<Skeleton />}>
        <ProcedureContent
          procedure={procedure}
          showDocView={procedure.style === "FLOW" ? showDocView : undefined}
        />
      </Suspense>

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
