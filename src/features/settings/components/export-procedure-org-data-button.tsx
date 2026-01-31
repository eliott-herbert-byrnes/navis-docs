"use client";

import { ExportProcedureOrgDataButtonDialog } from "./export-procedure-org-dialog";

const ExportProcedureOrgDataButton = () => {
  return (
    <ExportProcedureOrgDataButtonDialog
      title="Export Organization Procedure Data"
      description="Choose between JSON, Markdown, or CSV."
    />
  );
};

export { ExportProcedureOrgDataButton };
