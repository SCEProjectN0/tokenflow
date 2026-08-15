"use client";

import { FormEvent, useMemo, useState } from "react";

type Metrics = {
  original_tokens: number;
  optimized_tokens: number;
  saved_tokens: number;
  percentage_saved: number;
  budget_limit: number;
};

function compactPreview(value: string, limit = 260) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (!clean) return 'No content.';
  return clean.length > limit ? `${clean.slice(0, limit)}…` : clean;
}

export default function TokenOptimizerPage() {
  const demoExample = {
    systemPrompt: "You are a helpful assistant. Keep launch rules, quality gates, and rollback commitments intact while removing irrelevant details.",
    messages: [
      { role: "user", content: "Please explain the launch plan, QA gates, rollback, and support escalation." },
      { role: "assistant", content: "The launch date is Friday. Smoke tests, regression, and rollout verification are mandatory." },
      { role: "user", content: "We already know launch is Friday. Please keep only the launch status, quality gates, risk controls, and support escalation." },
      { role: "user", content: "Ignore unrelated notes and keep only the launch plan and rollback requirements." },
    ],
    documents: [
      "Project launch plan: we ship on Friday with smoke tests, regression coverage, and rollout verification.",
      "Risk controls include rollback, customer alerts, and support escalation if an incident occurs.",
      "Office coffee machine is irrelevant and should not be included in the final answer.",
      "Office coffee machine is irrelevant and should not be included in the final answer.",
    ],
    maxContext: 420,
  };

  const [systemPrompt, setSystemPrompt] = useState(demoExample.systemPrompt);
  const [messagesText, setMessagesText] = useState(
    JSON.stringify(demoExample.messages, null, 2),
  );
  const [documentsText, setDocumentsText] = useState(
    JSON.stringify(demoExample.documents, null, 2),
  );
  const [maxContext, setMaxContext] = useState(demoExample.maxContext);
  const [result, setResult] = useState<null | { ok: boolean; summary: string; optimized_messages: Array<{ role: string; content: string }>; selected_chunks: string[]; adaptive_mode?: string; recommended_model?: { provider: string; model: string } } & Metrics>(null);
  const [metrics, setMetrics] = useState<null | {
    totalRequests: number;
    totalSavedTokens: number;
    averageReduction: number;
    averageLatencyMs: number;
    estimatedCostSaved: number;
    cacheHitRatio: number;
    recent: Array<{ id: string; savedTokens: number; percentageSaved: number; latencyMs: number; estimatedCostSaved: number; summary: string }>;
  }>(null);
  const [loading, setLoading] = useState(false);

  const summaryMessage = useMemo(() => {
    if (!result) return "Run the optimizer to inspect the preserved context and savings.";
    return `${result.saved_tokens.toLocaleString()} tokens saved • ${result.percentage_saved.toFixed(1)}% reduction`;
  }, [result]);

  const beforePreview = useMemo(() => {
    try {
      const parsed = JSON.parse(messagesText || "[]");
      const messageText = Array.isArray(parsed)
        ? parsed
            .map((item) => `${item.role || 'user'}: ${item.content || ''}`)
            .join(' ')
        : String(messagesText || '');
      const documentText = (() => {
        try {
          const docs = JSON.parse(documentsText || "[]");
          return Array.isArray(docs) ? docs.join(' ') : String(documentsText || '');
        } catch {
          return String(documentsText || '');
        }
      })();
      return compactPreview(`${messageText} ${documentText}`);
    } catch {
      return compactPreview(String(messagesText || documentsText || 'No input yet.'));
    }
  }, [messagesText, documentsText]);

  const afterPreview = useMemo(() => {
    if (result?.optimized_messages?.length) {
      return result.optimized_messages
        .map((message) => `${message.role}: ${message.content}`)
        .join(' | ');
    }

    return 'System: You are a helpful assistant. Follow business constraints. | Summary: Launch timing • Quality gates • Risk control | Relevant document: Quality gates include smoke tests, regression, and rollout verification.';
  }, [result]);

  function handleLoadDemo() {
    setSystemPrompt(demoExample.systemPrompt);
    setMessagesText(JSON.stringify(demoExample.messages, null, 2));
    setDocumentsText(JSON.stringify(demoExample.documents, null, 2));
    setMaxContext(demoExample.maxContext);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = {
        systemPrompt,
        messages: JSON.parse(messagesText || "[]"),
        documents: JSON.parse(documentsText || "[]"),
        maxContextTokens: Number(maxContext) || 1200,
      };

      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      setResult(json);

      const metricsResponse = await fetch("/api/metrics", { method: "GET" });
      const metricsJson = await metricsResponse.json();
      setMetrics(metricsJson);
    } catch (error) {
      setResult({
        ok: false,
        original_tokens: 0,
        optimized_tokens: 0,
        saved_tokens: 0,
        percentage_saved: 0,
        budget_limit: Number(maxContext) || 1200,
        summary: error instanceof Error ? error.message : "Invalid JSON payload.",
        optimized_messages: [],
        selected_chunks: [],
      });
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-2xl border border-cyan-400/30 bg-slate-900/80 p-6 shadow-[0_20px_80px_rgba(14,165,233,0.15)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">Token Optimizer / Context Optimizer</p>
          <h1 className="mt-3 text-4xl font-black">MVP Token Budget Dashboard</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Reduces duplicate context, keeps the current request and system rules, and shows the amount of tokens and cost saved.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-300">System prompt</span>
              <textarea
                value={systemPrompt}
                onChange={(event) => setSystemPrompt(event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-300">Messages (JSON)</span>
              <textarea
                value={messagesText}
                onChange={(event) => setMessagesText(event.target.value)}
                rows={10}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-100 outline-none focus:border-cyan-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-300">Documents (JSON)</span>
              <textarea
                value={documentsText}
                onChange={(event) => setDocumentsText(event.target.value)}
                rows={8}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-100 outline-none focus:border-cyan-400"
              />
            </label>
          </div>

          <aside className="space-y-5 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-300">Max context tokens</span>
              <input
                type="number"
                min={150}
                value={maxContext}
                onChange={(event) => setMaxContext(Number(event.target.value) || 1200)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-lg font-bold text-white outline-none focus:border-cyan-400"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleLoadDemo}
                className="flex-1 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-violet-100 transition hover:bg-violet-500/20"
              >
                Demo with example
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-400 disabled:cursor-wait disabled:opacity-60"
              >
                {loading ? "Optimizing..." : "Run optimizer"}
              </button>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-200">Savings</div>
              <div className="mt-3 text-2xl font-black text-white">{summaryMessage}</div>
            </div>

            {result ? (
              <div className="space-y-3 text-sm text-slate-200">
                <div className="flex items-center justify-between"><span>Original</span><strong>{result.original_tokens}</strong></div>
                <div className="flex items-center justify-between"><span>Optimized</span><strong>{result.optimized_tokens}</strong></div>
                <div className="flex items-center justify-between"><span>Saved</span><strong>{result.saved_tokens}</strong></div>
                <div className="flex items-center justify-between"><span>Reduction</span><strong>{result.percentage_saved.toFixed(1)}%</strong></div>
                <div className="flex items-center justify-between"><span>Budget</span><strong>{result.budget_limit}</strong></div>
                <div className="flex items-center justify-between"><span>Mode</span><strong>{result.adaptive_mode || "light"}</strong></div>
                <div className="flex items-center justify-between"><span>Route</span><strong>{result.recommended_model ? `${result.recommended_model.provider}/${result.recommended_model.model}` : "balanced"}</strong></div>
              </div>
            ) : null}
          </aside>
        </form>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-rose-500/30 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-rose-300">До</div>
              <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-rose-200">raw context</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-200">{beforePreview}</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">После</div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">optimized</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-200">{compactPreview(afterPreview, 320)}</p>
          </div>
        </section>

        {result ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Optimized messages</div>
              <div className="mt-4 space-y-3">
                {result.optimized_messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300">{message.role}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{message.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Selected chunks</div>
              <div className="mt-4 space-y-3">
                {result.selected_chunks.length ? (
                  result.selected_chunks.map((chunk, index) => (
                    <div key={`${chunk}-${index}`} className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm leading-6 text-slate-200">
                      {chunk}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-400">No relevant document chunks were selected.</div>
                )}
              </div>
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Cost & efficiency metrics</div>
          {metrics ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Requests</div><div className="mt-2 text-2xl font-black text-white">{metrics.totalRequests}</div></div>
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Saved tokens</div><div className="mt-2 text-2xl font-black text-white">{metrics.totalSavedTokens.toLocaleString()}</div></div>
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Avg reduction</div><div className="mt-2 text-2xl font-black text-white">{metrics.averageReduction.toFixed(1)}%</div></div>
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Latency</div><div className="mt-2 text-2xl font-black text-white">{Math.round(metrics.averageLatencyMs)} ms</div></div>
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Cost saved</div><div className="mt-2 text-2xl font-black text-white">${metrics.estimatedCostSaved.toFixed(4)}</div></div>
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Cache hit</div><div className="mt-2 text-2xl font-black text-white">{metrics.cacheHitRatio.toFixed(1)}%</div></div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">No optimization metrics have been recorded yet.</div>
          )}
        </section>
      </div>
    </main>
  );
}
