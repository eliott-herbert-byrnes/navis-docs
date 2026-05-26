"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  AccessAlertDialogTrigger,
  AccessButton,
} from "@/components/ui/access-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAiConfiguration } from "../hooks/use-ai-configuration";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

const isCloudDeploy = process.env.NEXT_PUBLIC_DEPLOY_MODE === "cloud";

export function AiConfiguration() {
  const { statusQuery, saveMutation, removeMutation } = useAiConfiguration();
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
  const formDisabled = isLoading || isCloudDeploy;

  return (
    <>
      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="flex flex-col gap-1">
          <span className="font-semibold">AI configuration</span>
          <span className="text-sm text-muted-foreground">
            {isCloudDeploy
              ? "Organisation API keys are used on self-hosted Navis Docs only. Navis Docs cloud does not use organisation AI keys."
              : "Store your own Anthropic and OpenAI API keys for this organization. Keys are encrypted at rest. Leave a field blank to keep the current key unchanged."}
          </span>
        </div>

        {isCloudDeploy ? (
          <Alert className="border-muted">
            <AlertTitle>Self-hosted only</AlertTitle>
            <AlertDescription>
              API keys in Settings are for self-hosted deployments. Navis Docs
              cloud does not use organisation AI keys.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 max-w-md">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="anthropic-api-key">Anthropic API key</Label>
              <Badge variant={"default"}>
                {hasAnthropic ? "Configured" : "Not set"}
              </Badge>
              {hasAnthropic && !isCloudDeploy && (
                <AlertDialog>
                  <AccessAlertDialogTrigger adminOnly>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Remove Anthropic key</span>
                    </Button>
                  </AccessAlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Remove Anthropic API key?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will disable AI chat for your organisation until a
                        new key is added.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          removeMutation.mutate({ anthropic: true })
                        }
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove key
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
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
              disabled={formDisabled}
              className="shadow-none border"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="openai-api-key">OpenAI API key</Label>
              <Badge variant={"default"}>
                {hasOpenAi ? "Configured" : "Not set"}
              </Badge>
              {hasOpenAi && !isCloudDeploy && (
                <AlertDialog>
                  <AccessAlertDialogTrigger adminOnly>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Remove OpenAI key</span>
                    </Button>
                  </AccessAlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Remove OpenAI API key?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This key is stored for future use and removing it will
                        not affect AI chat.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeMutation.mutate({ openAi: true })}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove key
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <Input
              id="openai-api-key"
              name="openAiApiKey"
              type="password"
              autoComplete="off"
              value={openAi}
              onChange={(e) => setOpenAi(e.target.value)}
              placeholder={
                hasOpenAi ? "Enter a new key to replace the stored key" : "sk-…"
              }
              disabled={formDisabled}
              className="shadow-none border"
            />
          </div>

          <AccessButton
            adminOnly
            type="submit"
            variant="outline"
            disabled={formDisabled || saveMutation.isPending}
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
