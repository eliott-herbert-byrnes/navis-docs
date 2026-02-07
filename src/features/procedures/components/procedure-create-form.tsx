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
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";

type CreateProcedureFormProps = {
  categories: { id: string; name: string }[];
};

const CreateProcedureForm = ({ categories }: CreateProcedureFormProps) => {
  const router = useRouter();
  const [isCancelPending, startTransition] = useTransition();
  const [createNewCategory, setCreateNewCategory] = useState(
    categories.length === 0,
  );
  const { departmentId, teamId } = useProcedureRouteContext();

  const { createProcedure, isPending } = useCreateProcedure(
    departmentId,
    teamId,
  );

  const handleCancel = () => {
    startTransition(() => {
      router.replace(homePath());
    });
  };

  const handleNewCategoryChange = (checked: boolean) => {
    setCreateNewCategory(checked);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

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
                  <Field>
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
                  <FieldLabel htmlFor="procedureStyle">
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
            <Field orientation="horizontal">
              <Button type="submit" disabled={isPending || isCancelPending}>
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
