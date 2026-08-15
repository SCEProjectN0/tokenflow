"use client";

import { FormEvent, useState } from "react";

export default function AgentPage() {
  const [goal, setGoal] = useState("Prepare a launch brief and save only the critical facts.");
  const [task, setTask] = useState("Review the launch notes, identify the deadlines, quality gates, and risk controls, and return a short execution plan.");
  const [systemPrompt, setSystemPrompt] = useState("You are a local TokenFlow agent. Preserve critical rules, minimize token usage, and answer in a concise operational format.");
  const [documentsText, setDocumentsText] = useState(
    JSON.stringify(
      [
        "Launch plan: we ship on Friday with smoke tests, regression, and rollout verification.",
        "Risk controls include rollback, support escalation, and customer notifications.",
        "Duplicate content: launch plan is approved. Launch plan is approved.",
      ],
      null,
      2,
    ),
  );
  const [result, setResult] = useState<null | {
    ok: boolean;
    agent?: { name: string; mode: string; status: string; summary: string };
    goal?: string;
    task?: string;
    plan?: string[];
    optimization?: {
      original_tokens: number;
      optimized_tokens: number;
      saved_tokens: number;
      percentage_saved: number;
      budget_limit: number;
      adaptive_mode?: string;
      recommended_model?: { provider: string; model: string };
    };
  }>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          task,
          systemPrompt,
          documents: JSON.parse(documentsText || "[]"),
          maxContextTokens: 1200,
        }),
      });

      const json = await response.json();
      setResult(json);
    } catch (error) {
      setResult({
        ok: false,
        agent: { name: "TokenFlow Agent", mode: "error", status: "failed", summary: error instanceof Error ? error.message : "Invalid request." },
      });
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl border border-violet-400/30 bg-slate-900/80 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-violet-300">Agent + Optimizer</p>
          <h1 className="mt-3 text-4xl font-black">TokenFlow Agent</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            This agent runs together with the optimizer, keeps the critical context, and trims unnecessary tokens before execution.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-300">Goal</span>
              <textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={3} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-violet-400" />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-300">Task</span>
              <textarea value={task} onChange={(event) => setTask(event.target.value)} rows={4} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-violet-400" />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-300">System prompt</span>
              <textarea value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} rows={3} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-violet-400" />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-300">Documents (JSON)</span>
              <textarea value={documentsText} onChange={(event) => setDocumentsText(event.target.value)} rows={8} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-100 outline-none focus:border-violet-400" />
            </label>
          </div>

          <aside className="space-y-5 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-violet-400 disabled:cursor-wait disabled:opacity-60">
              {loading ? "Running agent..." : "Run agent"}
            </button>

            {result?.agent ? (
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-violet-200">Agent</div>
                <div className="mt-2 text-xl font-black">{result.agent.name}</div>
                <div className="mt-1 text-sm text-slate-200">Mode: {result.agent.mode}</div>
                <div className="mt-1 text-sm text-slate-200">Status: {result.agent.status}</div>
                <p className="mt-3 text-sm text-slate-200">{result.agent.summary}</p>
              </div>
            ) : null}

            {result?.optimization ? (
              <div className="space-y-3 text-sm text-slate-200">
                <div className="flex items-center justify-between"><span>Original</span><strong>{result.optimization.original_tokens}</strong></div>
                <div className="flex items-center justify-between"><span>Optimized</span><strong>{result.optimization.optimized_tokens}</strong></div>
                <div className="flex items-center justify-between"><span>Saved</span><strong>{result.optimization.saved_tokens}</strong></div>
                <div className="flex items-center justify-between"><span>Reduction</span><strong>{result.optimization.percentage_saved.toFixed(1)}%</strong></div>
                <div className="flex items-center justify-between"><span>Budget</span><strong>{result.optimization.budget_limit}</strong></div>
                <div className="flex items-center justify-between"><span>Adaptive</span><strong>{result.optimization.adaptive_mode || "light"}</strong></div>
                <div className="flex items-center justify-between"><span>Route</span><strong>{result.optimization.recommended_model ? `${result.optimization.recommended_model.provider}/${result.optimization.recommended_model.model}` : "balanced"}</strong></div>
              </div>
            ) : null}
          </aside>
        </form>

        {result?.plan ? (
          <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">Action plan</div>
            <div className="mt-4 space-y-3">
              {result.plan.map((line, index) => (
                <div key={`${line}-${index}`} className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm leading-6 text-slate-200">
                  {line}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
