"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ProcedureForViewWithRelations,
  ProcedureContentType,
} from "../types/types";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

function ProcedureContentSkeleton() {
  return (
    <div className="rounded-md border p-4 space-y-3">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

const RawTextEditor = dynamic(
  () =>
    import("./editors/raw-text-editor").then((mod) => ({
      default: mod.RawTextEditor,
    })),
  { ssr: false },
);

const StepsEditor = dynamic(
  () =>
    import("./editors/steps-editor").then((mod) => ({
      default: mod.StepsEditor,
    })),
  { ssr: false },
);

const FlowEditor = dynamic(
  () =>
    import("./editors/flow-editor").then((mod) => ({
      default: mod.FlowEditor,
    })),
  { ssr: false },
);

const YesNoPairsEditor = dynamic(
  () =>
    import("./editors/yesno-pairs-editor").then((mod) => ({
      default: mod.YesNoPairsEditor,
    })),
  { ssr: false },
);

export type ProcedureContentProps = {
  procedure: ProcedureForViewWithRelations;
  showDocView?: boolean;
  isDemo?: boolean;
};

function ProcedureContentLoaded({
  procedure,
  showDocView = false,
  isDemo = false,
}: ProcedureContentProps) {
  const content = procedure.publishedVersion
    ?.contentJSON as ProcedureContentType;

  const renderProcedureContent = () => {
    switch (procedure.style) {
      case "RAW":
        return (
          <RawTextEditor
            procedureId={procedure.id}
            content={content}
            onChange={() => {}}
            isPreview={true}
            isDemo={isDemo}
          />
        );
      case "STEPS":
        return (
          <StepsEditor
            content={content}
            onChange={() => {}}
            isPreview={true}
            isDemo={isDemo}
          />
        );
      case "FLOW":
        return (
          <FlowEditor
            content={content}
            onChange={() => {}}
            isPreview={true}
            isDemo={isDemo}
          />
        );
      case "YESNO":
        return (
          <YesNoPairsEditor
            content={content}
            onChange={() => {}}
            isPreview={true}
            isDemo={isDemo}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-muted-foreground">
            Unsupported procedure style
          </div>
        );
    }
  };

  // FLOW with doc visible: side-by-side on desktop, tabs on narrow
  if (procedure.style === "FLOW" && showDocView) {
    const flowPanel = (
      <div className="min-h-[400px] flex flex-col overflow-hidden">
        <FlowEditor
          content={content}
          onChange={() => {}}
          isPreview={true}
          isDemo={isDemo}
        />
      </div>
    );
    const docPanel = (
      <div className="min-h-[600px] overflow-auto rounded border-1">
        <RawTextEditor
          procedureId={procedure.id}
          content={{ tiptap: content?.tiptap }}
          onChange={() => {}}
          isPreview={true}
          isDemo={isDemo}
        />
      </div>
    );

    return (
      <Card className="min-h-[600px] overflow-hidden animate-fade-from-top bg-background">
        {/* Desktop: side-by-side */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-4 md:min-h-[600px] md:p-4">
          <div className="min-h-0 overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 overflow-auto">{flowPanel}</div>
          </div>
          <div className="min-h-0 overflow-auto flex flex-col">{docPanel}</div>
        </div>
        {/* Narrow: tabs, default to Text when View text was clicked */}
        <div className="md:hidden p-4">
          <Tabs defaultValue="text" className="flex flex-col min-h-[500px]">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="flow">Flow</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
            </TabsList>
            <TabsContent value="flow" className="flex-1 min-h-[450px] mt-2">
              {flowPanel}
            </TabsContent>
            <TabsContent value="text" className="flex-1 min-h-[450px] mt-2">
              <div className="overflow-auto">{docPanel}</div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    );
  }

  if (procedure.style === "FLOW") {
    return (
      <Card className="min-h-[600px] overflow-hidden animate-fade-from-top bg-background shadow-none border">
        {renderProcedureContent()}
      </Card>
    );
  }

  return (
    <Card className="p-0 min-h-[600px] animate-fade-from-top shadow-none bg-background">
      {renderProcedureContent()}
    </Card>
  );
}

const ProcedureContent = ({
  procedure,
  showDocView = false,
  isDemo = false,
}: ProcedureContentProps) => {
  if (!procedure.publishedVersion) {
    return (
      <EmptyState
        title="No content found"
        body="This procedure has no published version. Please publish the procedure to view the content."
      />
    );
  }

  return (
    <Suspense fallback={<ProcedureContentSkeleton />}>
      <ProcedureContentLoaded
        procedure={procedure}
        showDocView={showDocView}
        isDemo={isDemo}
      />
    </Suspense>
  );
};

export { ProcedureContent };
