"use client";

import { Button } from "@/components/ui/button";
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
    if (!input.trim() || isLoading) return;

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

      if (!response.ok) throw new Error("Failed to get response");

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
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-13 w-13 rounded-full shadow-lg z-50 bg-background text-foreground hover:bg-accent hover:text-accent-foreground border-2"
        variant="ghost"
        aria-label="Open AI chat"
      >
        <Brain className="h-6 w-6" />
      </Button>

      {/* Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[345px] p-0 flex flex-col outline-none focus:outline-none shadow-none rounded-none"
        >
          <SheetHeader className="flex flex-row pl-4 border-b">
            <SheetTitle><span className="">AI Assistant</span></SheetTitle>
          </SheetHeader>

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
                disabled={isLoading}
                className="flex-1 shadow-none border"
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
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
