import { viewProcessPath } from "@/app/paths";
import {
  ChunkResult,
  searchProcessChunks,
} from "@/features/ai/queries/search-chunks";
import { getAnthropic } from "@/lib/ai/anthropic";
import { getSessionUser, getUserTeamIds } from "@/lib/auth";
import { aiLimiter, getLimitByUser } from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

function getUniqueProcesses(chunks: ChunkResult[]) {
  const processMap = new Map();

  for (const chunk of chunks) {
    if (!processMap.has(chunk.processId)) {
      processMap.set(chunk.processId, {
        processId: chunk.processId,
        title: chunk.title,
        similarity: chunk.similarity,
      });
    }
  }

  return Array.from(processMap.values());
}

function buildNoResultsResponse(userQuery: string): string {
  userQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3);

  return `I couldn't find any processes that closely match your question.

Here are a few ways I can help:

1. Try being more specific: Instead of general terms, use specific process names or topics. For example:
   - Instead of "loans", try "loan approval" or "loan application requirements"
   - Instead of "customer questions", try "customer onboarding" or "customer complaints"

2. Browse by category: You can explore the process library to see what's available.

3. Ask me about:
   - Specific workflows (e.g., "How do I approve a loan?")
   - Required documentation (e.g., "What documents are needed for X?")
   - Step-by-step procedures (e.g., "Walk me through the Y process")

What would be most helpful for you?`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limiter = await aiLimiter();
    const { success } = await getLimitByUser(limiter, user.userId, "ai-chat");
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before sending another." },
        { status: 429 },
      );
    }

    const { message, teamId, departmentId, conversationHistory } =
      await req.json();

    if (!message || !teamId || !departmentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const userTeams = await getUserTeamIds(user.userId);
    if (!userTeams.includes(teamId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Tiered search
    let chunks = await searchProcessChunks(message, teamId, 5, 0.5);
    let searchTier: "strong" | "weak" | "none" = "strong";

    if (chunks.length === 0) {
      chunks = await searchProcessChunks(message, teamId, 10, 0.3);
      searchTier = chunks.length > 0 ? "weak" : "none";
    } else if (chunks[0].similarity < 0.5) {
      searchTier = "weak";
    }

    if (searchTier === "none") {
      return NextResponse.json({
        response: buildNoResultsResponse(message),
        sources: [],
      });
    }

    let context: string;
    let systemPrompt: string;

    if (searchTier === "strong") {
      // TIER 1: Direct answer mode
      context = chunks
        .map((chunk, i) => {
          return `[Process ${i + 1}: "${chunk.title}"]\n${chunk.chunkText}`;
        })
        .join("\n\n---\n\n");

      systemPrompt = `You are a helpful assistant for an internal process documentation system. 
    Your role is to help users find and understand processes.
    
    IMPORTANT RULES:
    1. Answer questions ONLY using the provided context below
    2. If the context doesn't contain the answer, say so and suggest the closest relevant process
    3. Always reference which process(es) you're referring to by their title
    4. Be concise but helpful
    5. If multiple processes are relevant, mention them all
    6. Never make up information not in the context
    7. NEVER generate or display URLs in your response
    8. Reference processes by title only - the system will provide clickable links
    
    Context (process chunks):
    ${context}`;
    } else {
      // TIER 2: Guide with options mode
      const uniqueProcesses = getUniqueProcesses(chunks);

      // Build a numbered list of processes
      const processList = uniqueProcesses
        .map((proc, i) => `${i + 1}. "${proc.title}"`)
        .join("\n");

      // Build context with summaries
      context = chunks
        .map((chunk) => {
          return `[Process: "${chunk.title}"]\n${chunk.chunkText}`;
        })
        .join("\n\n---\n\n");

      systemPrompt = `You are a helpful assistant for an internal process documentation system.
    
    The user's query was somewhat broad or vague, but I found these potentially relevant processes:
    
    ${processList}
    
    Context for each process:
    ${context}
    
    YOUR TASK:
    1. Briefly explain what each process covers based on the context (1-2 sentences each)
    2. Number them clearly (1, 2, 3, etc.) matching the list above
    3. Ask the user which one is most relevant to their question
    4. Offer to provide an overview of all if they're unsure
    5. Be encouraging and helpful - don't make them feel bad about the vague query
    
    IMPORTANT:
    - Reference processes by their exact titles in quotes
    - NEVER generate or display URLs
    - Keep explanations brief but informative
    - The system will provide clickable links automatically`;
    }

    const response = await getAnthropic().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...(conversationHistory || []),
        { role: "user", content: message },
      ],
    });

    const assistantMessage =
      response.content[0].type === "text"
        ? response.content[0].text
        : "I couldn't process your message. Please try again or contact support.";

    const sources = Array.from(
      new Map(
        chunks.map((chunk) => [
          chunk.processId,
          {
            processId: chunk.processId,
            title: chunk.title,
            url: viewProcessPath(departmentId, teamId, chunk.processId),
          },
        ]),
      ).values(),
    );

    return NextResponse.json({
      response: assistantMessage,
      sources,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
