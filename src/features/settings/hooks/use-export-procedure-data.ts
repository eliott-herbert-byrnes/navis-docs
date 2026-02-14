"use client";

import { useCallback } from "react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export type ExportFormat = "json" | "markdown" | "csv";

function escapeCsvCell(value: string | null | undefined): string {
  if (value === null) return "";
  const s = String(value);
  if (
    s.includes('"') ||
    s.includes(",") ||
    s.includes("\n") ||
    s.includes("\r")
  ) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function escapeMarkdownCell(value: string | null | undefined): string {
  if (value === null) return "";
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function useExportProcedureData(dialogOpen: boolean) {
  const { data, isLoading } = trpc.procedures.listForExport.useQuery(
    undefined,
    {
      enabled: dialogOpen,
    },
  );

  const procedures = data?.procedures ?? [];

  const exportWithFormat = useCallback(
    (format: ExportFormat) => {
      if (procedures.length === 0) {
        toast.error("No procedure data to export, create procedures first or refresh the page");
        return;
      }

      const createdAt = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const baseName = `procedures-export-${createdAt}`;

      if (format === "json") {
        const blob = new Blob([JSON.stringify(procedures, null, 2)], {
          type: "application/json",
        });
        downloadBlob(blob, `${baseName}.json`);
        toast.success("Exported as JSON");
        return;
      }

      if (format === "csv") {
        const headers = [
          "Title",
          "Description",
          "Category",
          "Team",
          "Department",
          "pendingVersion",
          "publishedVersion",
          "Slug",
          "Created At",
        ];
        const rows = procedures.map((p) => [
          escapeCsvCell(p.title),
          escapeCsvCell(p.description ?? null),
          escapeCsvCell(p.category?.name ?? null),
          escapeCsvCell(p.team.name),
          escapeCsvCell(p.team.department.name),
          escapeCsvCell(p.pendingVersion?.contentText as string),
          escapeCsvCell(p.publishedVersion?.contentText as string),
          escapeCsvCell(p.slug),
          escapeCsvCell(
            p.createdAt ? new Date(p.createdAt).toISOString() : null,
          ),
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
          "\n",
        );
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        downloadBlob(blob, `${baseName}.csv`);
        toast.success("Exported as CSV");
        return;
      }

      if (format === "markdown") {
        const headers = [
          "Title",
          "Description",
          "Category",
          "Team",
          "Department",
          "pendingVersion",
          "publishedVersion",
          "Slug",
          "Created At",
        ];
        const headerRow =
          "| " + headers.map(escapeMarkdownCell).join(" | ") + " |";
        const separator = "| " + headers.map(() => "---").join(" | ") + " |";
        const bodyRows = procedures.map((p) =>
          [
            p.title,
            p.description ?? "",
            p.category?.name ?? "",
            p.team.name,
            p.team.department.name,
            p.pendingVersion?.contentText ?? "",
            p.publishedVersion?.contentText ?? "",
            p.slug,
            p.createdAt ? new Date(p.createdAt).toISOString() : "",
          ]
            .map(escapeMarkdownCell)
            .join(" | "),
        );
        const md = [
          "# Procedure export",
          "",
          headerRow,
          separator,
          ...bodyRows.map((r) => "| " + r + " |"),
        ].join("\n");
        const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
        downloadBlob(blob, `${baseName}.md`);
        toast.success("Exported as Markdown");
      }
    },
    [procedures],
  );

  return { procedures, isLoading, exportWithFormat };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
