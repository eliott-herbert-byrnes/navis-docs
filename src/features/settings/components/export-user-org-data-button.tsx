"use client";

import { ExportUserOrgDataButtonDialog } from "./export-user-org-data-button-dialog";


const ExportUserOrgDataButton = () => {
  return (
    <ExportUserOrgDataButtonDialog
      title="Export Organization User Data"
      description="Choose between JSON, Markdown, or CSV."
    />
  );
};

export { ExportUserOrgDataButton };
