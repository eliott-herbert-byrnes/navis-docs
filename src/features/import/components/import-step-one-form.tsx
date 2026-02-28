"use client";

import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { homePath } from "@/app/paths";
import { MAX_FILE_SIZE } from "@/lib/tiptap-utils";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LucideLoaderCircle } from "lucide-react";
import { toast } from "sonner";
import type { DepartmentItem } from "./import-procedure-page";
import { useImportMutations } from "../hooks/use-import-mutations";

type ImportStepOneFormProps = {
    departments: DepartmentItem[];
    onSubmitSuccess: (jobId: string) => void;
};

const ImportStepOneForm = ({
    departments,
    onSubmitSuccess,
}: ImportStepOneFormProps) => {
    const router = useRouter();
    const [departmentId, setDepartmentId] = useState<string>("");
    const [teamId, setTeamId] = useState<string>("");

    const {startImportMutation} = useImportMutations();

    const isPending = startImportMutation.isPending;

    const handleCancel = () => {
        router.replace(homePath());
    };

    const selectedDepartment = departmentId
        ? departments.find((d) => d.id === departmentId)
        : null;
    const teams = selectedDepartment?.teams ?? [];

    const handleDepartmentChange = (value: string) => {
        setDepartmentId(value);
        setTeamId("");
    };

    const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const title = formData.get("procedureTitle")?.toString()?.trim();
        if (!title) {
            toast.error("Title is required");
            return;
        }
        if (title.length > 100) {
            toast.error("Title must be 100 characters or less");
            return;
        }
        if (!departmentId || !teamId) {
            toast.error("Please select a department and team");
            return;
        }

        const file = formData.get("file");
        if (!(file instanceof File) || file.size === 0) {
            toast.error("Please select a file to import");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error(
                `File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            );
            return;
        }

        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
        if (ext !== ".txt" && ext !== ".docx") {
            toast.error("Only .txt and .docx files are allowed");
            return;
        }

        try {
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);
            const res = await fetch("/api/procedure-imports", {
                method: "POST",
                body: uploadFormData,
            });

            if (!res.ok) {
                const err = (await res.json().catch(() => ({}))) as { error?: string };
                toast.error(err.error ?? "Upload failed");
                return;
            }

            const { fileKey } = (await res.json()) as { fileKey: string };
            const sourceType = ext === ".docx" ? "FILE_DOCX" : "FILE_TXT";

            startImportMutation.mutate(
                {
                    title,
                    teamId,
                    departmentId,
                    fileKey,
                    sourceType,
                },
                {
                    onSuccess: (data) => {
                        onSubmitSuccess(data.jobId);
                    },
                }
            );
        } catch {
            toast.error("Upload failed. Please try again.");
        }
    };

    return (
        <div className="w-full max-w-[700px] mx-auto ">
            <Card className="p-8 animate-fade-from-top">
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend>Import procedure</FieldLegend>
                            <FieldDescription>
                                Procedures are imported as Raw Text. Select a file and
                                destination, then continue to preview.
                            </FieldDescription>
                            <FieldSeparator />

                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="procedureTitle">Procedure title</FieldLabel>
                                    <FieldDescription>
                                        Required. Max 100 characters.
                                    </FieldDescription>
                                    <Input
                                        id="procedureTitle"
                                        placeholder="Procedure title"
                                        name="procedureTitle"
                                        required
                                        maxLength={100}
                                        disabled={isPending}
                                    />
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                        <FieldSeparator />

                        <FieldSet>
                            <FieldLegend>Department &amp; Team</FieldLegend>
                            <FieldDescription>
                                Select the department and team to import into.
                            </FieldDescription>
                            <Field>
                                <FieldLabel>Department</FieldLabel>
                                <Select
                                    value={departmentId}
                                    onValueChange={handleDepartmentChange}
                                    required
                                    disabled={isPending}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel>Team</FieldLabel>
                                <Select
                                    value={teamId}
                                    onValueChange={setTeamId}
                                    required
                                    disabled={isPending || !departmentId}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teams.map((team) => (
                                            <SelectItem key={team.id} value={team.id}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        </FieldSet>
                        <FieldSeparator />

                        <FieldSet>
                            <FieldLegend>File</FieldLegend>
                            <FieldDescription>
                                Accepted formats: .txt, .docx. Maximum size 5MB.
                            </FieldDescription>
                            <Field>
                                <FieldLabel htmlFor="import-file">Choose file</FieldLabel>
                                <Input
                                    id="import-file"
                                    name="file"
                                    type="file"
                                    accept=".txt,.docx"
                                    disabled={isPending}
                                    className="cursor-pointer"
                                />
                            </Field>
                        </FieldSet>
                        <FieldSeparator />

                        <Field orientation="horizontal">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <LucideLoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                        Starting import…
                                    </>
                                ) : (
                                    "Import"
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={handleCancel}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </Card>
        </div>
    );
};

export { ImportStepOneForm };
