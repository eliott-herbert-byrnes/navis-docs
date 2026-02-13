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

type ProcedureContentProps = {
  procedure: ProcedureForViewWithRelations;
};

const ProcedureContent = ({ procedure }: ProcedureContentProps) => {
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

  if (procedure.style === "FLOW") {
    return (
      <Card className="min-h-[600px] overflow-hidden animate-fade-from-top">
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
