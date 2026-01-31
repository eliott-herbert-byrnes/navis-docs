"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileInput, Loader2 } from "lucide-react";
import { useState } from "react";
import {
    ExportFormat,
    useExportProcedureData,
} from "../hooks/use-export-procedure-data";

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
    const { isLoading, exportWithFormat } =
        useExportProcedureData(open);

    const handleExport = () => {
        exportWithFormat(format as ExportFormat);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full flex justify-start gap-4">
                    <FileInput className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">Export Org Procedure Data</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Separator />
                <Select name="format" value={format} onValueChange={setFormat}>
                    <SelectTrigger className="mt-4">
                        <SelectValue placeholder="Select a format" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="markdown">Markdown</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                </Select>
                <DialogFooter className="flex flex-row gap-2 mt-4">
                    <Button
                        className="w-[75px]"
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="w-[75px]"
                        type="button"
                        variant="default"
                        onClick={handleExport}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Export"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export { ExportProcedureOrgDataButtonDialog };
