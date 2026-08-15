import { NextResponse } from "next/server";
import { optimizeRequest } from "@/lib/tokenOptimizer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    model?: unknown;
    system?: unknown;
    messages?: unknown;
    documents?: unknown;
    max_context_tokens?: unknown;
    maxContextTokens?: unknown;
  };

  const model = typeof body.model === "string" ? body.model : "token-optimizer-mvp";
  const systemPrompt = typeof body.system === "string" ? body.system : "You are a helpful assistant.";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const documents = Array.isArray(body.documents) ? body.documents : [];
  const maxContextTokens = Number(
    typeof body.max_context_tokens === "number"
      ? body.max_context_tokens
      : typeof body.maxContextTokens === "number"
        ? body.maxContextTokens
        : 1200,
  );

  const optimized = optimizeRequest({
    systemPrompt,
    messages,
    documents,
    maxContextTokens: Number.isFinite(maxContextTokens) ? maxContextTokens : 1200,
  });

  const answer = optimized.selectedChunks.length
    ? `Optimized response for ${optimized.selectedChunks.length} relevant document chunk(s). Summary: ${optimized.summary || "Key decisions preserved."}`
    : `Optimized response: ${optimized.summary || "Context was minimized without losing the required request."}`;

  return NextResponse.json({
    id: `opt-${Date.now()}`,
    object: "chat.completion",
    created: Date.now(),
    model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: answer,
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: optimized.originalTokens,
      completion_tokens: Math.max(24, Math.round(optimized.optimizedTokens * 0.18)),
      total_tokens: optimized.originalTokens + Math.max(24, Math.round(optimized.optimizedTokens * 0.18)),
    },
    optimization: {
      original_tokens: optimized.originalTokens,
      optimized_tokens: optimized.optimizedTokens,
      saved_tokens: optimized.savedTokens,
      percentage_saved: optimized.percentageSaved,
      budget_limit: optimized.budgetLimit,
    },
  });
}
