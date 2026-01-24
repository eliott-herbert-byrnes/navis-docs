"use client";

import { useEffect, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    processId: string;
    title: string;
    url: string;
  }>;
}

export function usePersistedChatState(
  departmentId: string,
  teamId: string
) {
  const storageKey = `chat-${departmentId}-${teamId}`;
  
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return []; 
    
    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load chat history:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [messages, storageKey]);

  const clearMessages = () => {
    setMessages([]);
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Failed to clear chat history:", error);
    }
  };

  return [messages, setMessages, clearMessages] as const;
}