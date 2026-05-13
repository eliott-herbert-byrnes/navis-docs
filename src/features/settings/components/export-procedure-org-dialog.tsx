"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AccessButton,
  AccessDialogTrigger,
} from "@/components/ui/access-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileInput } from "lucide-react";
import { useState } from "react";
import {
  ExportFormat,
  useExportProcedureData,
} from "../hooks/use-export-procedure-data";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

type ExportProcedureOrgDataButtonDialogProps = {
  title: string;
  description: string;
};
const ExportProcedureOrgDataButtonDialog = ({
  title,
  description,
}: ExportProcedureOrgDataButtonDialogProps) => {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState("json");
  const { isLoading, exportWithFormat } = useExportProcedureData(open);
  const pathname = usePathname();
  const isProcedureBaseRoute = pathname === "/procedure-base";

  const handleExport = () => {
    exportWithFormat(format as ExportFormat);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <AccessDialogTrigger adminOnly>
        <Button
          variant={isProcedureBaseRoute ? "ghost" : "outline"}
          className={cn("flex justify-start gap-2 max-w-[250px] shadow-none")}
        >
          <FileInput className={cn("w-4 h-4", "text-muted-foreground")} />
          <span className="font-semibold">Export Org Procedure Data</span>
        </Button>
      </AccessDialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Select name="format" value={format} onValueChange={setFormat}>
          <SelectTrigger className="w-1/2 shadow-none border">
            <SelectValue placeholder="Select a format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
        </Select>
        <DialogFooter className="flex flex-row gap-2 mt-4">
          <AccessButton
            adminOnly
            className="w-[75px] shadow-none border"
            type="button"
            variant="default"
            onClick={handleExport}
            isLoading={isLoading}
          >
            Export
          </AccessButton>
          <Button
            className="w-[75px] shadow-none border"
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ExportProcedureOrgDataButtonDialog };
