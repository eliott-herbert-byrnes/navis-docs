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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateOrganization } from "../hooks/use-onboarding-mutations";
import { useState } from "react";

export function OnboardForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const { createOrganization, isPending, error } = useCreateOrganization();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 6) {
      return;
    }
    createOrganization(name.trim());
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="animate-fade-from-top">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your organization</CardTitle>
          <CardDescription>
            Enter your organization name below to create your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
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
                  minLength={6}
                  maxLength={191}
                  disabled={isPending}
                />
                {error && (
                  <p className="text-sm text-red-500 mt-1">
                    {error.message}
                  </p>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isPending || name.trim().length < 6}>
                  {isPending ? "Creating..." : "Create Organization"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}