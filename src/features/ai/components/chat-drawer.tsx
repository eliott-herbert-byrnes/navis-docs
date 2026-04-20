"use client";

import { AccessButton, useAccessGate } from "@/components/ui/access-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth-context";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Brain, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./chat-message";
import { ChatSources } from "./chat-sources";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProcedureRouteContext } from "@/contexts/procedure-route-context";
import { usePersistedChatState } from "../hooks/use-persisted-chat-state";
import { ChatDeleteButton } from "./chat-delete-button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trpc } from "@/trpc/client";

type AIChatDrawerProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialMessage?: string;
  onInitialMessageConsumed?: () => void;
};

export function AIChatDrawer({
  open: controlledOpen,
  onOpenChange,
  initialMessage,
  onInitialMessageConsumed,
}: AIChatDrawerProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled =
    typeof controlledOpen === "boolean" && typeof onOpenChange === "function";
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  const { departmentId, teamId } = useProcedureRouteContext();
  const { allowed: canUseAi } = useAccessGate(false);
  const { isAdmin } = useAuthContext();
  const { data: aiAvailability } =
    trpc.organization.getAiAvailability.useQuery(undefined, {
      enabled: process.env.NEXT_PUBLIC_DEPLOY_MODE === "cloud",
      staleTime: 1000 * 60 * 5,
    });
  const keysConfigured = aiAvailability?.keysConfigured ?? true;
  const [messages, setMessages, clearMessages] = usePersistedChatState(
    departmentId,
    teamId,
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && initialMessage) {
      setInput(initialMessage);
      onInitialMessageConsumed?.();
    }
  }, [isOpen, initialMessage, onInitialMessageConsumed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUseAi || !input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const lastAssistantSources =
        [...messages]
          .reverse()
          .find((m) => m.role === "assistant" && m.sources && m.sources.length > 0)
          ?.sources?.map((s) => ({ procedureId: s.procedureId, title: s.title })) ?? [];

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          teamId,
          departmentId,
          conversationHistory: messages
            .map((m) => ({
              role: m.role,
              content: m.content,
            }))
            .slice(-6),
          previousSources: lastAssistantSources,
        }),
      });

      if (!response.ok) {
        // Always read the body first — the server sends descriptive error messages
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };

        if (response.status === 402) {
          // No Anthropic API key configured — tailor message by role
          const content =
            isAdmin && process.env.NEXT_PUBLIC_DEPLOY_MODE === "cloud"
              ? "No Anthropic API key is configured for your organisation. Go to Settings → AI Configuration to add one."
              : "AI chat is not available. Contact your organisation admin to configure an API key.";
          setMessages((prev) => [...prev, { role: "assistant", content }]);
          setIsLoading(false);
          return;
        }

        if (response.status === 429) {
          const content =
            body.error ??
            "Too many requests. Please wait a moment before sending another message.";
          setMessages((prev) => [...prev, { role: "assistant", content }]);
          setIsLoading(false);
          return;
        }

        // All other non-OK responses fall through to the catch block
        throw new Error(body.error ?? "Failed to get response");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong, please try again or refresh the page",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {keysConfigured ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full shadow-lg z-50 bg-brand text-foreground dark:text-background dark:hover:bg-brand/75 hover:text-accent-foreground hover:bg-brand/75 border w-14 h-14"
          variant="ghost"
          aria-label="Open AI chat"
        >
          <Brain size={64} className="size-8" strokeWidth={1} />
        </Button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            {/* Disabled buttons do not fire mouse events — wrap in span */}
            <span className="fixed bottom-6 right-6 inline-flex">
              <Button
                className="rounded-full shadow-lg z-50 w-14 h-14 border bg-brand text-foreground dark:text-background opacity-50 cursor-not-allowed"
                variant="ghost"
                disabled
                aria-label="AI chat unavailable"
              >
                <Brain size={64} className="size-8" strokeWidth={1} />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="left">
            {isAdmin
              ? "Add an Anthropic API key in Settings to enable AI chat"
              : "AI chat is not configured. Contact your organisation admin."}
          </TooltipContent>
        </Tooltip>
      )}

      {/* Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[345px] p-0 flex flex-col outline-none focus:outline-none shadow-none rounded-none"
        >
          <SheetHeader className="flex flex-row pl-4 border-b">
            <SheetTitle><span className="">AI Assistant</span></SheetTitle>
          </SheetHeader>

          {!canUseAi ? (
            <Alert className="mx-4 mt-3 shrink-0 border-muted">
              <AlertTitle>Read-only mode</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <span>
                  {isAdmin
                    ? "An active subscription is required to use the AI assistant."
                    : "Contact an organisation admin if you need access."}
                </span>
                {isAdmin ? (
                  <Link
                    href="/subscription"
                    className="text-primary font-medium underline underline-offset-4"
                  >
                    View subscription
                  </Link>
                ) : null}
              </AlertDescription>
            </Alert>
          ) : null}

          {canUseAi &&
          !keysConfigured &&
          process.env.NEXT_PUBLIC_DEPLOY_MODE === "cloud" ? (
            <Alert className="mx-4 mt-3 shrink-0 border-muted">
              <AlertTitle>AI chat not configured</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <span>
                  {isAdmin
                    ? "Add an Anthropic API key to enable the AI assistant."
                    : "Contact your organisation admin to configure AI chat."}
                </span>
                {isAdmin ? (
                  <Link
                    href="/settings"
                    className="text-primary font-medium underline underline-offset-4"
                  >
                    Go to Settings
                  </Link>
                ) : null}
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Messages */}
          <ScrollArea className="flex-1 overflow-y-auto relative" ref={scrollRef}>
            {messages.length === 0 ? (
              null
            ) : (
              <div className="flex flex-col">
                {messages.map((message, i) => (
                  <div key={i}>
                    <ChatMessage
                      role={message.role}
                      content={message.content}
                    />
                    {message.sources && (
                      <ChatSources sources={message.sources} />
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>


          {/* Input */}
          <form onSubmit={handleSubmit} className="pl-4 pb-4 pr-2">
            <div className="py-4 mr-10">
              <div className="bottom-0">
                <p className="text-sm text-muted-foreground">
                  The assistant is AI and can make mistakes. Double-check and clarify responses.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Ask about a procedure..."
                disabled={isLoading || !canUseAi}
                className="flex-1 shadow-none border"
              />
              <div className="flex flex-col gap-2">
                <AccessButton
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="bg-brand hover:bg-brand/75"
                >
                  <Send className="h-4 w-4" />
                </AccessButton>
                <ChatDeleteButton
                  isLoading={isLoading}
                  clearMessage={clearMessages}
                />
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
