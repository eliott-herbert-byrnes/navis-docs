import { viewProcedurePath } from "@/app/paths";
import {
  ChunkResult,
  getChunksByProcedureIds,
  searchProcedureChunks,
} from "@/features/ai/queries/search-chunks";
import { getAnthropic } from "@/lib/ai/anthropic";
import {
  AI_SELF_HOSTED_ONLY_USER,
  isAiEnabled,
} from "@/lib/ai/ai-enabled";
import { resolveOrgAiKeys } from "@/lib/ai/resolve-org-ai-keys";
import { getSessionUser, getUserTeamIds } from "@/lib/auth";
import { isCloud } from "@/lib/deploy-mode";
import { prisma } from "@/lib/prisma";
import { aiLimiter, getLimitByUser } from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

function getUniqueProcedures(chunks: ChunkResult[]) {
  const procedureMap = new Map();

  for (const chunk of chunks) {
    if (!procedureMap.has(chunk.procedureId)) {
      procedureMap.set(chunk.procedureId, {
        procedureId: chunk.procedureId,
        title: chunk.title,
        similarity: chunk.similarity,
      });
    }
  }

  return Array.from(procedureMap.values());
}

function buildNoResultsResponse(userQuery: string): string {
  userQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3);

  return `I couldn't find any procedures that closely match your question.

Here are a few ways I can help:

1. Try being more specific: Instead of general terms, use specific procedure names or topics. For example:
   - Instead of "loans", try "loan approval" or "loan application requirements"
   - Instead of "customer questions", try "customer onboarding" or "customer complaints"

2. Browse by category: You can explore the procedure library to see what's available.

3. Ask me about:
   - Specific workflows (e.g., "How do I approve a loan?")
   - Required documentation (e.g., "What documents are needed for X?")
   - Step-by-step procedures (e.g., "Walk me through the Y procedure")

What would be most helpful for you?`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAiEnabled()) {
      return NextResponse.json(
        { error: AI_SELF_HOSTED_ONLY_USER },
        { status: 403 },
      );
    }

    const limiter = await aiLimiter();
    const { success } = await getLimitByUser(limiter, user.userId, "ai-chat");
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before sending another." },
        { status: 429 },
      );
    }

    const {
      message,
      teamId,
      departmentId,
      conversationHistory,
      previousSources,
    } = await req.json();

    if (!message || !teamId || !departmentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const lastUserMessage =
      (conversationHistory ?? [])
        .slice()
        .reverse()
        .find(
          (m: { role: string; content: string }) =>
            m?.role === "user" &&
            typeof m.content === "string" &&
            m.content.trim().length > 0,
        )?.content ?? null;

    const userTeams = await getUserTeamIds(user.userId);
    if (!userTeams.includes(teamId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        department: { select: { orgId: true } },
      },
    });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const resolved = await resolveOrgAiKeys(team.department.orgId);
    if (!resolved.cloudEntitled) {
      return NextResponse.json(
        {
          error:
            "AI features require an active Pro or Enterprise subscription.",
        },
        { status: 403 },
      );
    }

    let anthropicApiKey: string | undefined;
    if (isCloud()) {
      if (!resolved.anthropicKey) {
        return NextResponse.json(
          {
            error:
              "No Anthropic API key configured for your organization. Add your key in Settings → AI Configuration.",
          },
          { status: 402 },
        );
      }
      anthropicApiKey = resolved.anthropicKey;
    } else {
      anthropicApiKey = resolved.anthropicKey ?? undefined;
      if (!anthropicApiKey && !process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(
          {
            error:
              "No Anthropic API key configured. Add your key in Settings → AI Configuration or set ANTHROPIC_API_KEY on the server.",
          },
          { status: 402 },
        );
      }
    }

    // Tiered search
    async function runTieredSearch(query: string) {
      let chunks = await searchProcedureChunks(query, teamId, 5, 0.5);
      let tier: "strong" | "weak" | "none" = "strong";

      if (chunks.length === 0) {
        chunks = await searchProcedureChunks(query, teamId, 10, 0.3);
        tier = chunks.length > 0 ? "weak" : "none";
      } else if (chunks[0].similarity < 0.5) {
        tier = "weak";
      }

      return { chunks, tier };
    }

    let { chunks, tier: searchTier } = await runTieredSearch(message);

    // Fallback: retry search using the last user message from history
    if (
      searchTier === "none" &&
      lastUserMessage &&
      lastUserMessage !== message
    ) {
      const fallback = await runTieredSearch(lastUserMessage);
      if (fallback.tier !== "none") {
        chunks = fallback.chunks;
        searchTier = "strong"; // always treat a follow-up fallback as direct-answer mode
      }
    }

    // Sticky context: fetch chunks for procedures surfaced in the previous turn
    const previousProcedureIds: string[] = (
      (previousSources ?? []) as { procedureId: string; title: string }[]
    ).map((s) => s.procedureId);

    const stickyChunks = await getChunksByProcedureIds(
      previousProcedureIds,
      teamId,
    );

    if (stickyChunks.length > 0) {
      const existingChunkIds = new Set(chunks.map((c: ChunkResult) => c.id));

      if (searchTier === "none") {
        // No results from any search — fall back to the previous turn's procedure content
        chunks = stickyChunks;
        searchTier = "strong";
      } else {
        // Have current results — supplement with sticky chunks from the same procedures
        // so the model retains full procedure content across follow-up turns
        const currentProcedureIds = new Set(
          chunks.map((c: ChunkResult) => c.procedureId),
        );
        const relevantStickyChunks = stickyChunks.filter(
          (c) =>
            currentProcedureIds.has(c.procedureId) &&
            !existingChunkIds.has(c.id),
        );
        chunks = [...chunks, ...relevantStickyChunks];
      }
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
          return `[Procedure ${i + 1}: "${chunk.title}"]\n${chunk.chunkText}`;
        })
        .join("\n\n---\n\n");

      systemPrompt = `You are a helpful assistant for an internal procedure documentation system. 
    Your role is to help users find and understand procedures.
    
    IMPORTANT RULES:
    1. Answer questions ONLY using the provided context below
    2. If the context doesn't contain the answer, say so and suggest the closest relevant procedure
    3. Always reference which procedure(es) you're referring to by their title
    4. Be concise but helpful
    5. If multiple procedures are relevant, mention them all
    6. Never make up information not in the context
    7. NEVER generate or display URLs in your response
    8. Reference procedures by title only - the system will provide clickable links
    9. If a procedure cannot be located or does not exist, do not offer to make a note of it. Instead, inform the user that the procedure may not yet be documented and suggest they contact their organisation's support team to request it be added.
    
    Context (procedure chunks):
    ${context}`;
    } else {
      // TIER 2: Guide with options mode
      const uniqueProcedures = getUniqueProcedures(chunks);

      // Build a numbered list of procedures
      const procedureList = uniqueProcedures
        .map((proc, i) => `${i + 1}. "${proc.title}"`)
        .join("\n");

      // Build context with summaries
      context = chunks
        .map((chunk) => {
          return `[Procedure: "${chunk.title}"]\n${chunk.chunkText}`;
        })
        .join("\n\n---\n\n");

      systemPrompt = `You are a helpful assistant for an internal procedure documentation system.
    
    The user's query was somewhat broad or vague, but I found these potentially relevant procedures:
    
    ${procedureList}
    
    Context for each procedure:
    ${context}
    
    YOUR TASK:
    1. Briefly explain what each procedure covers based on the context (1-2 sentences each)
    2. Number them clearly (1, 2, 3, etc.) matching the list above
    3. Ask the user which one is most relevant to their question
    4. Offer to provide an overview of all if they're unsure
    5. Be encouraging and helpful - don't make them feel bad about the vague query
    
    IMPORTANT:
    - Reference procedures by their exact titles in quotes
    - NEVER generate or display URLs
    - Keep explanations brief but informative
    - The system will provide clickable links automatically
    - If a procedure cannot be located or does not exist, do not offer to make a note of it. Instead, inform the user that the procedure may not yet be documented and suggest they contact their organisation's support team to request it be added.`;
    }

    const response = await getAnthropic(anthropicApiKey).messages.create({
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
        : "I couldn't procedure your message. Please try again or contact support.";

    const sources = Array.from(
      new Map(
        chunks.map((chunk) => [
          chunk.procedureId,
          {
            procedureId: chunk.procedureId,
            title: chunk.title,
            url: viewProcedurePath(departmentId, teamId, chunk.procedureId),
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
