"use client";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Form } from "@/components/form/form";
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
import { createProcess } from "../actions/create-process";
import { useActionState } from "@/components/form/hooks/use-action-state";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/form/field-error";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { homePath } from "@/app/paths";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LucideLoaderCircle } from "lucide-react";
import { ProcessSelectCategories } from "./process-select-categories";

type CreateProcessFormProps = {
  departmentId: string;
  teamId: string;
  categories: { id: string; name: string }[];
};

const CreateProcessForm = ({
  departmentId,
  teamId,
  categories,
}: CreateProcessFormProps) => {
  const [actionState, action, isPending] = useActionState(
    createProcess,
    EMPTY_ACTION_STATE
  );
  const [isCancelPending, startTransition] = useTransition();
  const [createNewCategory, setCreateNewCategory] = useState(
    categories.length === 0
  );
  const router = useRouter();

  useEffect(() => {
    if (actionState.status !== "SUCCESS") return;
    const to = actionState.data?.redirect;
    if (to) router.push(to);
  }, [actionState.status, actionState.data?.redirect, router]);

  const handleCancel = () => {
    startTransition(() => {
      router.replace(homePath());
    });
  };

  const handleNewCategoryChange = (checked: boolean) => {
    setCreateNewCategory(checked);
  };

  return (
    <div className="w-full max-w-[700px] mx-auto my-auto">
      <Card className="p-6 animate-from-top animate-duration-300">
        <Form action={action} actionState={actionState}>
          <input type="hidden" name="departmentId" value={departmentId} />
          <input type="hidden" name="teamId" value={teamId} />
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Create a new process </FieldLegend>
              <FieldDescription>
                Enter the details of the process to create a new one.
              </FieldDescription>
              <FieldSeparator />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="processTitle">Title</FieldLabel>
                  <Input
                    id="processTitle"
                    placeholder="Process Title"
                    name="processTitle"
                    required
                    disabled={isPending}
                  />
                  <FieldError actionState={actionState} name="processTitle" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="processDescription">
                    Description
                  </FieldLabel>
                  <Input
                    id="processDescription"
                    name="processDescription"
                    placeholder="Enter a short description of the process"
                    className="resize-none"
                    required
                    disabled={isPending}
                  />
                  <FieldError
                    actionState={actionState}
                    name="processDescription"
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldLegend>Process Category</FieldLegend>
              <FieldDescription>
                Select the category of the process or create a new one.
              </FieldDescription>
              <Field>
                <FieldLabel>Categories</FieldLabel>
                <ProcessSelectCategories
                  categories={categories}
                  name="processCategoryId"
                  isDisabled={createNewCategory}
                />
                <FieldDescription>
                  Select an existing category or create a new one.
                </FieldDescription>
              </Field>
              <FieldGroup>
                <Field orientation="horizontal">
                  <Checkbox
                    id="newProcessCategory"
                    name="newProcessCategory"
                    checked={createNewCategory}
                    onCheckedChange={handleNewCategoryChange}
                    disabled={isPending}
                  />
                  <FieldLabel
                    htmlFor="newProcessCategory"
                    className="font-normal"
                  >
                    Create a new category
                  </FieldLabel>
                </Field>
                {createNewCategory && (
                  <Field>
                    <Input
                      id="newProcessCategoryName"
                      placeholder="New Category Name"
                      name="newProcessCategoryName"
                      required
                      disabled={isPending}
                    />
                    <FieldError
                      actionState={actionState}
                      name="newProcessCategoryName"
                    />
                  </Field>
                )}
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldGroup>
                <FieldSet>
                  <FieldLabel htmlFor="processStyle">Process Style</FieldLabel>
                  <FieldDescription>
                    Select the style of the process.
                  </FieldDescription>
                  <RadioGroup
                    defaultValue="raw"
                    name="processStyle"
                    disabled={isPending}
                  >
                    <FieldLabel htmlFor="rawtext">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Raw Text</FieldTitle>
                          <FieldDescription>
                            Use raw text to describe the process.
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
                            Use steps / checklist to describe the process.
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
                            Use a flow diagram to describe the process.
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
                            Use yes / no questions to answer the process.
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
        </Form>
      </Card>
    </div>
  );
};

export { CreateProcessForm };
