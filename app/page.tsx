export default function Home() {
  const modules = [
    {
      title: "TokenFlow Agent",
      description: "Агент, который работает вместе с оптимизатором и сохраняет критические правила при сжатии контекста.",
      href: "/agent",
      accent: "from-violet-500/20 to-slate-900",
    },
    {
      title: "Context Optimizer",
      description: "Автоматически удаляет дубликаты, сокращает историю и выбирает релевантные куски документов по бюджету токенов.",
      href: "/token-optimizer",
      accent: "from-cyan-500/20 to-slate-900",
    },
    {
      title: "OpenAI-compatible API",
      description: "Единый шлюз для chat/completions с использованием текущего токен-оптимизатора и метрик качества.",
      href: "/api/v1/chat/completions",
      accent: "from-emerald-500/20 to-slate-900",
    },
  ];

  const features = [
    "Adaptive compression by context load",
    "Priority scoring for relevant chunks",
    "Budget-aware routing and model selection",
    "Persistent optimization metrics",
    "Obsidian-ready architecture",
    "Production-friendly API surface",
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-[0_20px_80px_rgba(14,165,233,0.12)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">TokenFlow</p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">AI Context Optimizer Workspace</h1>
          </div>

          <nav className="flex flex-wrap gap-2 text-sm">
            <a href="/agent" className="rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-2 font-semibold text-violet-100 transition hover:bg-violet-500/20">Agent</a>
            <a href="/token-optimizer" className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 font-semibold text-cyan-100 transition hover:bg-cyan-500/20">Optimizer</a>
            <a href="/api/metrics" className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 font-semibold text-emerald-100 transition hover:bg-emerald-500/20">Metrics</a>
          </nav>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-6 shadow-[0_24px_120px_rgba(14,165,233,0.12)]">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-cyan-300">System overview</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Optimize prompts before the model ever reads them.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              TokenFlow reduces duplicate context, protects the critical instructions, and keeps only the relevant facts inside the available token budget.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/token-optimizer" className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:brightness-110">Demo with example</a>
              <a href="/agent" className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-cyan-300">Open agent</a>
              <a href="/token-optimizer" className="rounded-xl border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-cyan-400 hover:text-cyan-200">Run optimizer</a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Savings</div>
                <div className="mt-3 text-3xl font-black text-white">25%</div>
                <div className="mt-1 text-sm text-slate-400">benchmark reduction</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Budget mode</div>
                <div className="mt-3 text-3xl font-black text-white">Adaptive</div>
                <div className="mt-1 text-sm text-slate-400">light to critical</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">API route</div>
                <div className="mt-3 text-3xl font-black text-white">OpenAI</div>
                <div className="mt-1 text-sm text-slate-400">compatible</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">Live pipeline</div>
            <div className="mt-5 space-y-4">
              {[
                "Input prompt + documents + chat history",
                "Deduplication and history summarization",
                "Relevance scoring over document chunks",
                "Budget-aware pruning with critical guardrails",
                "Model routing and result telemetry",
              ].map((step, index) => (
                <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 p-3">
                  <div className="grid size-8 place-items-center rounded-full bg-cyan-500/20 text-sm font-black text-cyan-200">{index + 1}</div>
                  <div className="text-sm leading-6 text-slate-200">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 text-xs font-bold uppercase tracking-[0.26em] text-slate-400">Entry points</div>
          <div className="grid gap-5 md:grid-cols-3">
            {modules.map((module) => (
              <a key={module.title} href={module.href} className={`group block rounded-3xl border border-slate-800 bg-gradient-to-br ${module.accent} p-[1px] transition hover:-translate-y-1 hover:border-cyan-500/60`}>
                <div className="h-full rounded-[calc(1.5rem-1px)] bg-slate-950/90 p-5">
                  <div className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">Module</div>
                  <h3 className="mt-3 text-2xl font-black text-white">{module.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{module.description}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-cyan-200">Open now →</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="mb-5 text-xs font-bold uppercase tracking-[0.26em] text-slate-400">Core capabilities</div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div key={feature} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
                {feature}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
