const test = require('node:test');
const assert = require('node:assert/strict');
const { optimizeRequest, estimateTokens, summarizeHistory } = require('./tokenOptimizer.js');

test('estimateTokens returns a positive number for text', () => {
  const result = estimateTokens('Hello world from the optimizer');
  assert.ok(result > 0);
  assert.equal(typeof result, 'number');
});

test('optimizeRequest reduces token usage and preserves required context', () => {
  const result = optimizeRequest({
    systemPrompt: 'You are a helpful assistant. Follow the business rules exactly.',
    messages: [
      { role: 'user', content: 'Summarize the project brief.' },
      { role: 'assistant', content: 'The project brief says we ship on Friday.' },
      { role: 'user', content: 'We need to ship on Friday. The project brief says we ship on Friday.' },
      { role: 'user', content: 'The product team wants a launch plan, release checklist, status, and detailed notes about strategy, funding, and launch risk.' },
      { role: 'user', content: 'Please ignore the previous conversation and focus only on the launch plan. The launch plan needs to include roadmap, quality gates, and risk management.' },
      { role: 'user', content: 'Please explain the launch plan, QA gates, risks, and timeline in detail.' },
    ],
    documents: [
      'Project launch plan: we ship on Friday. Quality gates include smoke tests, regression, and rollout verification.',
      'Launch plan: risk management includes rollback, customer notifications, and support escalation.',
      'Duplicate content: launch plan is approved. Launch plan is approved. Launch plan is approved.',
    ],
    maxContextTokens: 480,
  });

  assert.ok(result.originalTokens > result.optimizedTokens);
  assert.ok(result.savedTokens > 0);
  assert.ok(result.percentageSaved > 0);
  assert.ok(Array.isArray(result.optimizedMessages));
  assert.ok(Array.isArray(result.selectedChunks));
  assert.ok(result.optimizedMessages.some((item) => item.role === 'system' || item.role === 'user'));
});

test('summarizeHistory condenses repeated discussion into a single summary', () => {
  const summary = summarizeHistory([
    { role: 'user', content: 'We need launch plan and release checklist.' },
    { role: 'assistant', content: 'We have launch plan and release checklist.' },
    { role: 'user', content: 'Need launch plan and release checklist again.' },
    { role: 'assistant', content: 'The conditions are: launch date is Friday; quality gates must be passed.' },
    { role: 'user', content: 'Please keep launch date Friday and quality gates mandatory.' },
  ]);

  assert.ok(summary.length > 0);
  assert.match(summary, /launch|Friday|quality/i);
});
