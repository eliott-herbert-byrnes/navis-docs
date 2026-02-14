"use client";

import { useCallback } from "react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export type ExportFormat = "json" | "markdown" | "csv";

function escapeCsvCell(value: string | null | undefined): string {
  if (value == null) return "";
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
  if (value == null) return "";
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function useExportUserData(dialogOpen: boolean) {
  const { data, isLoading } = trpc.users.getOrgUsersForExport.useQuery(
    undefined,
    {
      enabled: dialogOpen,
    },
  );

  const users = data ?? [];

  const exportWithFormat = useCallback(
    (format: ExportFormat) => {
      if (!users) {
        toast.error(
          "No user data to export, add members first or refresh the page",
        );
        return;
      }

      const createdAt = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const baseName = `users-export-${createdAt}`;

      if (format === "json") {
        const blob = new Blob([JSON.stringify(users, null, 2)], {
          type: "application/json",
        });
        downloadBlob(blob, `${baseName}.json`);
        toast.success("Exported as JSON");
        return;
      }

      if (format === "csv") {
        const headers = [
          "Name",
          "Email",
          "Id",
          "OrgId",
          "UserId",
          "Role",
          "CreatedAt",
        ];
        const rows = users.map((u) => [
          escapeCsvCell(u.user.name),
          escapeCsvCell(u.user.email),
          escapeCsvCell(u.id),
          escapeCsvCell(u.orgId),
          escapeCsvCell(u.userId),
          escapeCsvCell(u.role),
          escapeCsvCell(
            u.createdAt ? new Date(u.createdAt).toISOString() : null,
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
          "Name",
          "Email",
          "Id",
          "OrgId",
          "UserId",
          "Role",
          "CreatedAt",
        ];
        const headerRow =
          "| " + headers.map(escapeMarkdownCell).join(" | ") + " |";
        const separator = "| " + headers.map(() => "---").join(" | ") + " |";
        const bodyRows = users.map((u) =>
          [
            u.user.name,
            u.user.email,
            u.id,
            u.orgId,
            u.userId,
            u.role,
            u.createdAt ? new Date(u.createdAt).toISOString() : "",
          ]
            .map(escapeMarkdownCell)
            .join(" | "),
        );
        const md = [
          "# Users export",
          "",
          headerRow,
          separator,
          ...bodyRows.map((u) => "| " + u + " |"),
        ].join("\n");
        const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
        downloadBlob(blob, `${baseName}.md`);
        toast.success("Exported as Markdown");
      }
    },
    [users],
  );

  return { users, isLoading, exportWithFormat };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
