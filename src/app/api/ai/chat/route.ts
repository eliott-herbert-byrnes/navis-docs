import { viewProcessPath } from "@/app/paths";
import { searchProcessChunks } from "@/features/ai/queries/search-chunks";
import { anthropic } from "@/lib/ai/anthropic";
import { getSessionUser, getUserTeamIds } from "@/lib/auth";
import { aiLimiter, getLimitByUser } from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = await getLimitByUser(aiLimiter, user.userId, "ai-chat");
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before sending another." },
        { status: 429 }
      );
    }

    const { message, teamId, departmentId } = await req.json();

    if (!message || !teamId || !departmentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userTeams = await getUserTeamIds(user.userId);
    if (!userTeams.includes(teamId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const chunks = await searchProcessChunks(message, teamId, 5);

    if (chunks.length === 0) {
      return NextResponse.json({
        response:
          "I couldn't find any relevant processes for your question. Try rephrasing or browse the process library.",
        sources: [],
      });
    }

    const context = chunks
      .map((chunk, i) => {
        const url = viewProcessPath(departmentId, teamId, chunk.processId);
        return `[Process ${i + 1}: "${chunk.title}"]\n${chunk.chunkText}\nURL: ${url}`;
      })
      .join("\n\n---\n\n");

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `You are a helpful assistant for an internal process documentation system. 
        Your role is to help users find and understand processes.
        
        IMPORTANT RULES:
        1. Answer questions ONLY using the provided context below
        2. If the context doesn't contain the answer, say so and suggest the closest relevant process
        3. Always reference which process(es) you're referring to by their title
        4. Be concise but helpful
        5. If multiple processes are relevant, mention them all
        6. Never make up information not in the context

        Context (process chunks):
        ${context}`,
      messages: [
        {
          role: "user",
          content: message,
        },
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
        ])
      ).values()
    );

    return NextResponse.json({
      response: assistantMessage,
      sources,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
