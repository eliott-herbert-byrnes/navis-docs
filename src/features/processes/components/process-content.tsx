"use client";

import { EmptyState } from "@/components/empty-state";
import { ProcessForViewWithRelations, ProcessContentType } from "../types/types";
import { RawTextEditor } from "./editors/raw-text-editor";
import { StepsEditor } from "./editors/steps-editor";
import { FlowEditor } from "./editors/flow-editor";
import { YesNoPairsEditor } from "./editors/yesno-pairs-editor";
import { Card } from "@/components/ui/card";
import { ReactFlowProvider } from "reactflow";

type ProcessContentProps = {
  process: ProcessForViewWithRelations;
};

const ProcessContent = ({ process }: ProcessContentProps) => {
  const content = process.publishedVersion?.contentJSON as ProcessContentType;

  if (!process.publishedVersion) {
    return (
      <EmptyState
        title="No content found"
        body="This process has no published version. Please publish the process to view the content."
      />
    );
  }

  const renderProcessContent = () => {
    switch (process.style) {
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
            Unsupported process style
          </div>
        );
    }
  };

  if (process.style === "FLOW") {
    return (
      <Card className="min-h-[600px] overflow-hidden">
        {renderProcessContent()}
      </Card>
    );
  }

  return <Card className="p-6 min-h-[600px]">{renderProcessContent()}</Card>;
};

export { ProcessContent };
