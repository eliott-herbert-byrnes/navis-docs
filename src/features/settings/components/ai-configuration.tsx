"use client";

import { Badge } from "@/components/ui/badge";
import { AccessButton } from "@/components/ui/access-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAiConfiguration } from "../hooks/use-ai-configuration";
import { Loader2 } from "lucide-react";
import { useState } from "react";

function AiConfigurationInner() {
  const { statusQuery, saveMutation } = useAiConfiguration();
  const [anthropic, setAnthropic] = useState("");
  const [openAi, setOpenAi] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      anthropicApiKey: anthropic || undefined,
      openAiApiKey: openAi || undefined,
    });
  };

  const isLoading = statusQuery.isLoading;
  const hasAnthropic = statusQuery.data?.hasAnthropicKey ?? false;
  const hasOpenAi = statusQuery.data?.hasOpenAiKey ?? false;

  return (
    <>
      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="flex flex-col gap-1">
          <span className="font-semibold">AI configuration</span>
          <span className="text-sm text-muted-foreground">
            Store your own Anthropic and OpenAI API keys for this organization.
            Keys are encrypted at rest. Leave a field blank to keep the current
            key unchanged.
          </span>
        </div>

        <div className="grid gap-4 max-w-md">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="anthropic-api-key">Anthropic API key</Label>
              <Badge variant={hasAnthropic ? "default" : "secondary"}>
                {hasAnthropic ? "Configured" : "Not set"}
              </Badge>
            </div>
            <Input
              id="anthropic-api-key"
              name="anthropicApiKey"
              type="password"
              autoComplete="off"
              value={anthropic}
              onChange={(e) => setAnthropic(e.target.value)}
              placeholder={
                hasAnthropic
                  ? "Enter a new key to replace the stored key"
                  : "sk-ant-api03-…"
              }
              disabled={isLoading}
              className="shadow-none border"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="openai-api-key">OpenAI API key</Label>
              <Badge variant={hasOpenAi ? "default" : "secondary"}>
                {hasOpenAi ? "Configured" : "Not set"}
              </Badge>
            </div>
            <Input
              id="openai-api-key"
              name="openAiApiKey"
              type="password"
              autoComplete="off"
              value={openAi}
              onChange={(e) => setOpenAi(e.target.value)}
              placeholder={
                hasOpenAi
                  ? "Enter a new key to replace the stored key"
                  : "sk-…"
              }
              disabled={isLoading}
              className="shadow-none border"
            />
          </div>

          <AccessButton
            adminOnly
            type="submit"
            variant="outline"
            disabled={isLoading || saveMutation.isPending}
            className="w-full flex justify-start gap-2 shadow-none border max-w-[250px] mt-1"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            <span className="font-semibold">Save API keys</span>
          </AccessButton>
        </div>
      </form>
      <Separator className="my-6" />

    </>
  );
}

/**
 * Cloud-only: per-org encrypted AI keys. Hidden when self-hosted.
 */
export function AiConfiguration() {
  if (process.env.NEXT_PUBLIC_DEPLOY_MODE !== "cloud") {
    return null;
  }

  return <AiConfigurationInner />;
}
