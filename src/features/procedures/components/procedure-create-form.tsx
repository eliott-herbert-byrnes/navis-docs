"use client";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { homePath } from "@/app/paths";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LucideLoaderCircle } from "lucide-react";
import { ProcedureSelectCategories } from "./procedure-select-categories";
import { useCreateProcedure } from "../hooks/use-procedure-mutations";
import { useProcedureRouteContextOptional } from "@/contexts/procedure-route-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RolloutRoleFilter } from "@prisma/client";
import { trpc } from "@/trpc/client";

type CreateProcedureFormProps = {
  categories: { id: string; name: string }[];
  cancelPath?: string;
  redirectOnSuccess?: boolean;
};

const CreateProcedureForm = ({ categories, cancelPath, redirectOnSuccess }: CreateProcedureFormProps) => {
  const router = useRouter();
  const [isCancelPending, startTransition] = useTransition();
  const [createNewCategory, setCreateNewCategory] = useState(
    categories.length === 0,
  );
  const [notifyOnPublishChecked, setNotifyOnPublishChecked] = useState(false);
  const [emailOnPublishChecked, setEmailOnPublishChecked] = useState(false);
  const [newsOnPublishChecked, setNewsOnPublishChecked] = useState(false);
  const routeContext = useProcedureRouteContextOptional();
  const hasContext = routeContext !== null;

  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const effectiveDepartmentId = hasContext ? routeContext.departmentId : selectedDepartmentId;
  const effectiveTeamId = hasContext ? routeContext.teamId : selectedTeamId;

  const { data: departmentData } = trpc.department.list.useQuery(undefined, {
    enabled: !hasContext,
  });
  const departments = departmentData?.list ?? [];

  const { data: categoriesData } = trpc.procedures.categoriesWithCount.useQuery(
    { teamId: effectiveTeamId },
    { enabled: !!effectiveTeamId },
  );

  const resolvedCategories = hasContext
    ? categories
    : (categoriesData?.data ?? []);

  const { createProcedure, isPending } = useCreateProcedure(
    effectiveDepartmentId,
    effectiveTeamId,
    { redirectOnSuccess: redirectOnSuccess ?? true, onSuccess: () => router.replace(cancelPath ?? homePath()) },
  );

  const handleCancel = () => {
    startTransition(() => router.replace(cancelPath ?? homePath()));
  };

  const isSubmitBlocked = !hasContext && (!selectedDepartmentId || !selectedTeamId);

  const handleNewCategoryChange = (checked: boolean) => {
    setCreateNewCategory(checked);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const notifyOnPublish = formData.get("notifyOnPublish") === "on";
    const emailOnPublish = formData.get("emailOnPublish") === "on";
    const newsOnPublish = formData.get("newsOnPublish") === "on";

    const notifyRoleFilter = notifyOnPublish
      ? (formData.get("notifyRoleFilter") as RolloutRoleFilter | null)
      : null;

    const emailRoleFilter = emailOnPublish
      ? (formData.get("emailRoleFilter") as RolloutRoleFilter | null)
      : null;

    createProcedure({
      procedureTitle: String(formData.get("procedureTitle") ?? "").trim(),
      procedureDescription: String(
        formData.get("procedureDescription") ?? "",
      ).trim(),
      procedureCategoryId: createNewCategory
        ? undefined
        : String(formData.get("procedureCategoryId") ?? "").trim() || undefined,
      newProcedureCategory: createNewCategory || undefined,
      newProcedureCategoryName: createNewCategory
        ? String(formData.get("newProcedureCategoryName") ?? "").trim() ||
        undefined
        : undefined,
      procedureStyle: String(formData.get("procedureStyle") ?? "raw").trim() as
        | "raw"
        | "steps"
        | "flow"
        | "yesno",

      notifyOnPublish,
      notifyRoleFilter,
      emailOnPublish,
      emailRoleFilter,
      newsOnPublish,
    });
  };

  return (
    <div className="w-full max-w-[700px] mx-auto my-auto">
      <Card className="p-6 animate-fade-from-top">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Create a new procedure</FieldLegend>
              <FieldDescription>
                Enter the details of the procedure to create a new one.
              </FieldDescription>
              <FieldSeparator />
            </FieldSet>
            {!hasContext && (
              <>
                <FieldSet>
                  <FieldLegend>Department and Team</FieldLegend>
                  <FieldDescription>Select which team this procedure belongs to.</FieldDescription>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Department</FieldLabel>
                      <Select value={selectedDepartmentId} onValueChange={(v) => { setSelectedDepartmentId(v); setSelectedTeamId(""); }} disabled={isPending}>
                        <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Team</FieldLabel>
                      <Select value={selectedTeamId} onValueChange={setSelectedTeamId} disabled={!selectedDepartmentId || isPending}>
                        <SelectTrigger><SelectValue placeholder="Select a team" /></SelectTrigger>
                        <SelectContent>
                          {departments.find(d => d.id === selectedDepartmentId)?.teams.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                </FieldSet>
                <FieldSeparator />
              </>
            )}
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="procedureTitle">Title</FieldLabel>
                  <Input
                    id="procedureTitle"
                    placeholder="Procedure Title"
                    name="procedureTitle"
                    required
                    disabled={isPending}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="procedureDescription">
                    Description
                  </FieldLabel>
                  <Input
                    id="procedureDescription"
                    name="procedureDescription"
                    placeholder="Enter a short description of the procedure"
                    className="resize-none"
                    required
                    disabled={isPending}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Procedure Category</FieldLegend>
              <FieldDescription>
                Select the category of the procedure or create a new one.
              </FieldDescription>

              <Field>
                <FieldLabel>Categories</FieldLabel>
                <ProcedureSelectCategories
                  categories={categories}
                  name="procedureCategoryId"
                  isDisabled={createNewCategory}
                />
                <FieldDescription>
                  Select an existing category or create a new one.
                </FieldDescription>
              </Field>
              <FieldGroup>
                <Field orientation="horizontal">
                  <Checkbox
                    id="newProcedureCategory"
                    name="newProcedureCategory"
                    checked={createNewCategory}
                    onCheckedChange={handleNewCategoryChange}
                    disabled={isPending}
                  />
                  <FieldLabel
                    htmlFor="newProcedureCategory"
                    className="font-normal"
                  >
                    Create a new category
                  </FieldLabel>
                </Field>
                {createNewCategory && (
                  <Field className="animate-fade-from-top">
                    <Input
                      id="newProcedureCategoryName"
                      placeholder="New Category Name"
                      name="newProcedureCategoryName"
                      required
                      disabled={isPending}
                    />
                  </Field>
                )}
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />

            <FieldSet>
              <FieldGroup>
                <FieldSet>
                  <FieldLabel className="text-1xl" htmlFor="procedureStyle">
                    Procedure Style
                  </FieldLabel>
                  <FieldDescription>
                    Select the style of the procedure.
                  </FieldDescription>
                  <RadioGroup
                    defaultValue="raw"
                    name="procedureStyle"
                    disabled={isPending}
                  >
                    <FieldLabel htmlFor="rawtext">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Raw Text</FieldTitle>
                          <FieldDescription>
                            Use raw text to describe the procedure.
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value="raw" id="rawtext" />
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="steps">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Steps / Checklist</FieldTitle>
                          <FieldDescription>
                            Use steps / checklist to describe the procedure.
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value="steps" id="steps" />
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="flow">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Flow Diagram</FieldTitle>
                          <FieldDescription>
                            Use a flow diagram to describe the procedure.
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value="flow" id="flow" />
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="yesno">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Yes / No Questions</FieldTitle>
                          <FieldDescription>
                            Use yes / no questions to answer the procedure.
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value="yesno" id="yesno" />
                      </Field>
                    </FieldLabel>
                  </RadioGroup>
                </FieldSet>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Procedure roll-out</FieldLegend>
              <FieldDescription>
                Choose how to notify users when this procedure is published.
              </FieldDescription>
              <FieldGroup className="space-y-4">
                {/* Notify users (in-app) */}
                <Field>
                  <Field orientation="horizontal">
                    <Checkbox
                      id="notifyOnPublish"
                      name="notifyOnPublish"
                      checked={notifyOnPublishChecked}
                      onCheckedChange={(v) => setNotifyOnPublishChecked(!!v)}
                      disabled={isPending}
                    />
                    <FieldContent>
                      <FieldTitle>Notify users in app</FieldTitle>
                      <FieldDescription>
                        Show this as an unread procedure for selected users.
                      </FieldDescription>
                    </FieldContent>
                  </Field>

                  {notifyOnPublishChecked && (
                    <div className="ml-7 max-w-xs animate-fade-from-top">
                      {/* <FieldLabel htmlFor="notifyRoleFilter">
                        Who should see it as unread?
                        </FieldLabel> */}
                      <Select name="notifyRoleFilter" disabled={isPending}>
                        <SelectTrigger id="notifyRoleFilter" className="w-full">
                          <SelectValue placeholder="Select a user group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={RolloutRoleFilter.ALL_USERS}>
                            All users
                          </SelectItem>
                          <SelectItem value={RolloutRoleFilter.ADMINS_ONLY}>
                            Admins (Owners + Admins)
                          </SelectItem>
                          <SelectItem value={RolloutRoleFilter.MEMBERS_ONLY}>
                            Members
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </Field>

                {/* Email users */}
                <Field className="w-full">
                  <Field orientation="horizontal">
                    <Checkbox
                      id="emailOnPublishChecked"
                      name="emailOnPublishChecked"
                      checked={emailOnPublishChecked}
                      onCheckedChange={(v) => setEmailOnPublishChecked(!!v)}
                      disabled={isPending}
                    />
                    <FieldContent>
                      <FieldTitle>Notify users by email</FieldTitle>
                      <FieldDescription>
                        Send an automated email notification to selected users.
                      </FieldDescription>
                    </FieldContent>
                  </Field>

                  {emailOnPublishChecked && (
                    <div className="ml-7 max-w-xs animate-fade-from-top">
                      {/* <FieldLabel htmlFor="notifyRoleFilter">
                        Who should see it as unread?
                        </FieldLabel> */}
                      <Select name="emailRoleFilter" disabled={isPending}>
                        <SelectTrigger id="emailRoleFilter" className="w-full">
                          <SelectValue placeholder="Select a user group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={RolloutRoleFilter.ALL_USERS}>
                            All users
                          </SelectItem>
                          <SelectItem value={RolloutRoleFilter.ADMINS_ONLY}>
                            Admins (Owners + Admins)
                          </SelectItem>
                          <SelectItem value={RolloutRoleFilter.MEMBERS_ONLY}>
                            Members
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </Field>
                {/* News post */}
                <Field>
                  <Field orientation="horizontal">
                    <Checkbox
                      id="newsOnPublish"
                      name="newsOnPublish"
                      checked={newsOnPublishChecked}
                      onCheckedChange={(v) => setNewsOnPublishChecked(!!v)}
                      disabled={isPending}
                    />
                    <FieldContent>
                      <FieldTitle>Create news post</FieldTitle>
                      <FieldDescription>
                        Add an automated news post for this team when published.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />
            <Field orientation="horizontal">
              <Button type="submit" disabled={isPending || isCancelPending || isSubmitBlocked}>
                {isPending ? (
                  <>
                    <LucideLoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={handleCancel}
                disabled={isPending || isCancelPending}
              >
                {isCancelPending ? (
                  <LucideLoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  "Cancel"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </Card>
    </div>
  );
};

export { CreateProcedureForm };
