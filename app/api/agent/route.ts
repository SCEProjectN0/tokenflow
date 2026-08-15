import { NextResponse } from "next/server";
import { optimizeRequest } from "@/lib/tokenOptimizer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    goal?: unknown;
    task?: unknown;
    systemPrompt?: unknown;
    messages?: unknown;
    documents?: unknown;
    max_context_tokens?: unknown;
    maxContextTokens?: unknown;
  };

  const goal =
    typeof body.goal === "string" && body.goal.trim()
      ? body.goal.trim()
      : "Complete the current task with the smallest necessary context and preserve the most important constraints.";

  const task =
    typeof body.task === "string" && body.task.trim()
      ? body.task.trim()
      : "Review the request, identify the essential facts, and return a concise action plan.";

  const systemPrompt =
    typeof body.systemPrompt === "string" && body.systemPrompt.trim()
      ? body.systemPrompt.trim()
      : "You are a local TokenFlow agent. Keep the task focused, preserve critical rules, and return a concise operational plan.";

  const messages = Array.isArray(body.messages) ? body.messages : [
    { role: "user", content: goal },
    { role: "user", content: task },
  ];

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

  const plan = [
    `Goal: ${goal}`,
    `Task: ${task}`,
    `Context summary: ${optimized.summary || "The key facts are retained and the rest is minimized."}`,
    `Working mode: ${optimized.mode || "balanced"}; provider: ${optimized.recommendedModel?.provider || "balanced"}/${optimized.recommendedModel?.model || "gpt-4o"}`,
    `Execution rules: use ${optimized.selectedChunks.length || 1} relevant chunk(s), preserve critical constraints, and keep the output concise.`,
  ];

  return NextResponse.json({
    ok: true,
    agent: {
      name: "TokenFlow Agent",
      mode: optimized.mode || "balanced",
      status: "ready",
      summary: optimized.summary || "Key facts preserved.",
    },
    goal,
    task,
    plan,
    optimization: {
      original_tokens: optimized.originalTokens,
      optimized_tokens: optimized.optimizedTokens,
      saved_tokens: optimized.savedTokens,
      percentage_saved: optimized.percentageSaved,
      budget_limit: optimized.budgetLimit,
      adaptive_mode: optimized.adaptiveMode,
      recommended_model: optimized.recommendedModel,
    },
  });
}
