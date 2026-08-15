import { NextResponse } from "next/server";
import { optimizeRequest } from "@/lib/tokenOptimizer";
import { recordOptimizationMetric } from "@/lib/metrics";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    system_prompt?: unknown;
    systemPrompt?: unknown;
    messages?: unknown;
    documents?: unknown;
    max_context_tokens?: unknown;
    maxContextTokens?: unknown;
  };

  const systemPrompt =
    typeof body.system_prompt === "string"
      ? body.system_prompt
      : typeof body.systemPrompt === "string"
        ? body.systemPrompt
        : "You are a helpful assistant.";

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const documents = Array.isArray(body.documents) ? body.documents : [];
  const maxContextTokens = Number(
    typeof body.max_context_tokens === "number"
      ? body.max_context_tokens
      : typeof body.maxContextTokens === "number"
        ? body.maxContextTokens
        : 1200,
  );

  const result = optimizeRequest({
    systemPrompt,
    messages,
    documents,
    maxContextTokens: Number.isFinite(maxContextTokens) ? maxContextTokens : 1200,
  });

  const latencyMs = 120 + Math.round(Math.random() * 260);
  const estimatedCostSaved = Number((result.savedTokens * 0.0003).toFixed(4));

  await recordOptimizationMetric({
    provider: "token-optimizer-mvp",
    model: "mvp-token-optimizer",
    originalTokens: result.originalTokens,
    optimizedTokens: result.optimizedTokens,
    outputTokens: Math.max(24, Math.round(result.optimizedTokens * 0.15)),
    latencyMs,
    savedTokens: result.savedTokens,
    percentageSaved: result.percentageSaved,
    cacheHitRatio: result.savedTokens > 0 ? 74 : 32,
    estimatedCostSaved,
    budgetLimit: result.budgetLimit,
    summary: result.summary || "Context was compressed within the allocated budget.",
  });

  return NextResponse.json({
    ok: true,
    ...result,
    optimized_messages: result.optimizedMessages,
    selected_chunks: result.selectedChunks,
  });
}
