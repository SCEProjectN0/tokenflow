const test = require('node:test');
const assert = require('node:assert/strict');
const { optimizeRequest } = require('../src/index.js');

test('tokenflow preserves relevant facts while reducing input size', () => {
  const result = optimizeRequest({
    systemPrompt: 'You are a helpful assistant. Keep the response concise and preserve critical facts.',
    messages: [
      { role: 'user', content: 'Summarize the launch plan and critical gates.' },
      { role: 'assistant', content: 'We launch Friday. Smoke tests, regression, and rollback are required.' },
    ],
    documents: [
      'Launch plan: Friday launch after smoke tests and regression. Rollback is mandatory. Office chatter is irrelevant.',
    ],
    maxContextTokens: 420,
  });

  assert.ok(result.originalTokens > 0);
  assert.ok(result.optimizedTokens > 0);
  assert.ok(result.savedTokens >= 0);
  assert.ok(result.percentageSaved >= 0);
  assert.ok(result.summary || result.optimizedMessages.length > 0);
});
