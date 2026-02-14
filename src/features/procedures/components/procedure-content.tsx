"use client";

import { EmptyState } from "@/components/ui/empty-state";
import {
  ProcedureForViewWithRelations,
  ProcedureContentType,
} from "../types/types";
import { RawTextEditor } from "./editors/raw-text-editor";
import { StepsEditor } from "./editors/steps-editor";
import { FlowEditor } from "./editors/flow-editor";
import { YesNoPairsEditor } from "./editors/yesno-pairs-editor";
import { Card } from "@/components/ui/card";
import { ReactFlowProvider } from "reactflow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ProcedureContentProps = {
  procedure: ProcedureForViewWithRelations;
  /** When true and procedure is FLOW with doc, show flow and doc side-by-side (desktop) or tabs (narrow). */
  showDocView?: boolean;
};

const ProcedureContent = ({
  procedure,
  showDocView = false,
}: ProcedureContentProps) => {
  const content = procedure.publishedVersion
    ?.contentJSON as ProcedureContentType;

  if (!procedure.publishedVersion) {
    return (
      <EmptyState
        title="No content found"
        body="This procedure has no published version. Please publish the procedure to view the content."
      />
    );
  }

  const renderProcedureContent = () => {
    switch (procedure.style) {
      case "RAW":
        return (
          <RawTextEditor
            content={content}
            onChange={() => {}}
            isPreview={true}
          />
        );
      case "STEPS":
        return (
          <StepsEditor content={content} onChange={() => {}} isPreview={true} />
        );
      case "FLOW":
        return (
          <ReactFlowProvider>
            <FlowEditor
              content={content}
              onChange={() => {}}
              isPreview={true}
            />
          </ReactFlowProvider>
        );
      case "YESNO":
        return (
          <YesNoPairsEditor
            content={content}
            onChange={() => {}}
            isPreview={true}
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
        <ReactFlowProvider>
          <FlowEditor content={content} onChange={() => {}} isPreview={true} />
        </ReactFlowProvider>
      </div>
    );
    const docPanel = (
      <div className="min-h-[400px] overflow-auto">
        <RawTextEditor
          content={{ tiptap: content?.tiptap }}
          onChange={() => {}}
          isPreview={true}
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
      <Card className="min-h-[600px] overflow-hidden animate-fade-from-top bg-background">
        {renderProcedureContent()}
      </Card>
    );
  }

  return (
    <Card className="p-6 min-h-[600px] animate-fade-from-top">
      {renderProcedureContent()}
    </Card>
  );
};

export { ProcedureContent };
