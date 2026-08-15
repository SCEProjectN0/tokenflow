const { optimizeRequest } = require('./lib/tokenOptimizer.js');

const result = optimizeRequest({
  systemPrompt: 'You are a helpful assistant. Follow the business rules exactly.',
  messages: [
    { role: 'user', content: 'Summarize the project brief.' },
    { role: 'assistant', content: 'The project brief says we ship on Friday.' },
    { role: 'user', content: 'We need to ship on Friday. The project brief says we ship on Friday.' },
    { role: 'user', content: 'The product team wants a launch plan, release checklist, status, and detailed notes about strategy, funding, and launch risk.' },
    { role: 'user', content: 'Please ignore the previous conversation and focus only on the launch plan. The launch plan needs to include roadmap, quality gates, and risk management.' },
    { role: 'user', content: 'Please explain the launch plan, QA gates, risks, and timeline in detail.' }
  ],
  documents: [
    'Project launch plan: we ship on Friday. Quality gates include smoke tests, regression, and rollout verification.',
    'Launch plan: risk management includes rollback, customer notifications, and support escalation.',
    'Duplicate content: launch plan is approved. Launch plan is approved. Launch plan is approved.'
  ],
  maxContextTokens: 480
});

console.log(JSON.stringify({
  originalTokens: result.originalTokens,
  optimizedTokens: result.optimizedTokens,
  savedTokens: result.savedTokens,
  percentageSaved: Number(result.percentageSaved.toFixed(2)),
  adaptiveMode: result.adaptiveMode,
  mode: result.mode,
  budgetLimit: result.budgetLimit,
  summary: result.summary
}, null, 2));
