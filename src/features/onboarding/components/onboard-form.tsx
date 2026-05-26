"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getOrganizationNameValidationMessage,
  ORG_NAME_MAX_LENGTH_CREATE,
  ORG_NAME_MIN_LENGTH,
} from "@/lib/org-name";
import { useCreateOrganization } from "../hooks/use-onboarding-mutations";
import { useState } from "react";

export function OnboardForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const { createOrganization, isPending } = useCreateOrganization();

  const trimmedName = name.trim();
  const validationMessage = getOrganizationNameValidationMessage(
    trimmedName,
    ORG_NAME_MAX_LENGTH_CREATE,
  );
  const isNameInvalid = validationMessage !== null;
  const isSubmitDisabled = isPending || isNameInvalid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNameInvalid) return;
    createOrganization(trimmedName);
  };

  const submitButton = (
    <Button type="submit" disabled={isSubmitDisabled} className="w-full">
      {isPending ? "Creating..." : "Create Organization"}
    </Button>
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="animate-fade-from-top">
        <CardHeader>
          <CardTitle className="text-xl">Create your organization</CardTitle>
          <CardDescription>
            Enter your organization name below to create your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field>
                <Input
                  id="org-name"
                  name="name"
                  type="text"
                  placeholder="Terra Nova Inc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={ORG_NAME_MIN_LENGTH}
                  maxLength={ORG_NAME_MAX_LENGTH_CREATE}
                  disabled={isPending}
                />
              </Field>
              <Field>
                {isNameInvalid && !isPending ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block w-full">{submitButton}</span>
                    </TooltipTrigger>
                    <TooltipContent>{validationMessage}</TooltipContent>
                  </Tooltip>
                ) : (
                  submitButton
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
