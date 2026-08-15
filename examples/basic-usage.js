const { optimizeRequest } = require('../src/index.js');

const result = optimizeRequest({
  systemPrompt: 'You are a helpful assistant. Preserve critical facts and minimize noise.',
  messages: [
    { role: 'user', content: 'Summarize the launch plan and keep only release-critical facts.' },
    { role: 'assistant', content: 'We launch Friday, smoke tests and regression must pass, and rollback must be ready.' },
  ],
  documents: [
    'Launch plan: Friday launch after smoke and regression. Rollback is required. A long office story is irrelevant.',
  ],
  maxContextTokens: 420,
});

console.log(JSON.stringify({
  originalTokens: result.originalTokens,
  optimizedTokens: result.optimizedTokens,
  savedTokens: result.savedTokens,
  percentageSaved: result.percentageSaved,
  summary: result.summary,
}, null, 2));
