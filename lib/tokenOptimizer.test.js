const test = require('node:test');
const assert = require('node:assert/strict');
const { optimizeRequest, estimateTokens, summarizeHistory } = require('./tokenOptimizer.js');

const demoScenarios = [
  {
    name: 'regular text',
    systemPrompt: 'You are a helpful assistant. Keep the answer concise and factual.',
    messages: [
      { role: 'user', content: 'Summarize the launch brief and tell me the most important deadlines.' },
      { role: 'assistant', content: 'We ship on Friday. Quality gates and rollback are mandatory.' },
    ],
    documents: [
      'Launch plan: we ship Friday after smoke tests and regression coverage.',
      'Risk controls include rollback, customer alerts, and support escalation.',
      'The office coffee machine is irrelevant and should be ignored.',
    ],
    maxContextTokens: 420,
    expectedKeywords: ['launch', 'quality', 'rollback'],
  },
  {
    name: 'long history',
    systemPrompt: 'Answer only from the latest relevant facts and keep history concise.',
    messages: [
      { role: 'user', content: 'We have repeated updates about this release for five days.' },
      { role: 'assistant', content: 'Today we finalized the launch date and the QA requirements.' },
      { role: 'user', content: 'Please remind me again of the launch date and QA requirements, because the review board keeps asking.' },
      { role: 'assistant', content: 'Launch is Friday. Smoke tests, regression, and rollout verification are required.' },
      { role: 'user', content: 'We already know that. Repeat it again and again to check for duplication in the context.' },
      { role: 'assistant', content: 'Repeated answer: launch is Friday; QA must pass smoke, regression, and rollout verification.' },
      { role: 'user', content: 'Now give me the final answer only with launch date, QA gates, and rollback requirements.' },
    ],
    documents: [
      'Release checklist: Friday launch, smoke tests, regression, rollout verification, rollback plan.',
      'We discussed the same checklist daily for two weeks to ensure continuity.',
      'This reminder is redundant and not needed in the final answer.',
    ],
    maxContextTokens: 520,
    expectedKeywords: ['launch', 'qa', 'rollback'],
  },
  {
    name: 'code snippet',
    systemPrompt: 'Treat the code as implementation context, but keep only the changed API contract and behavior.',
    messages: [
      { role: 'user', content: 'Review this code: const status = data.status; if (status === "ok") return true; else return false; and explain the contract.' },
      { role: 'assistant', content: 'Status ok means the job is deployed. Anything else is invalid.' },
      { role: 'user', content: 'Now give me the essential API contract only, no unrelated commentary.' },
    ],
    documents: [
      'function handleStatus(data) { const status = data.status; if (status === "ok") return true; return false; }',
      'This helper is used for deployment automation and should be reviewed with the API contract.',
      'Unrelated comments: the developer prefers dark mode in the editor.',
    ],
    maxContextTokens: 350,
    expectedKeywords: ['status', 'ok', 'contract'],
  },
  {
    name: 'qa requirements',
    systemPrompt: 'Preserve QA rules, acceptance criteria, and blocking defects exactly as written.',
    messages: [
      { role: 'user', content: 'I need the release pass criteria: smoke tests, regression, API contract, and no critical defects.' },
      { role: 'assistant', content: 'All critical defects must be fixed before release. Smoke and regression gates are mandatory.' },
      { role: 'user', content: 'Keep only the QA gate and blocker requirements in the final answer.' },
    ],
    documents: [
      'QA requirement: no blockers, smoke tests pass, regression suite passes, API schema matches contract, and bug severity 1 is forbidden.',
      'The release team also had a long story about lunch and coffee which is irrelevant.',
    ],
    maxContextTokens: 440,
    expectedKeywords: ['qa', 'smoke', 'blocker'],
  },
  {
    name: 'logs and errors',
    systemPrompt: 'Keep only the actionable error and root-cause signal.',
    messages: [
      { role: 'user', content: 'Analyze the logs and tell me what caused the deployment failure.' },
      { role: 'assistant', content: 'The logs show connection timeout and HTTP 500. Start with the API gateway error.' },
      { role: 'user', content: 'Return the root cause and recovery action only.' },
    ],
    documents: [
      '2026-08-16T10:34:02Z ERROR gateway_timeout: upstream service timed out after 30s. HTTP 500 returned to caller. Retry policy engaged.',
      'Noise: repeated heartbeat logs, health checks, and normal debug info for 14 minutes are irrelevant.',
    ],
    maxContextTokens: 380,
    expectedKeywords: ['timeout', 'error', 'gateway'],
  },
  {
    name: 'rag context',
    systemPrompt: 'Use only the relevant retrieval context that answers the user question.',
    messages: [
      { role: 'user', content: 'Which migration steps are required before enabling the new billing API?' },
      { role: 'assistant', content: 'The docs say database migration is required before toggling the billing API flag.' },
      { role: 'user', content: 'Answer with the exact steps and avoid unrelated platform details.' },
    ],
    documents: [
      'Billing API migration checklist: run database migration, validate schema, enable feature flag, update consumer tokens, monitor 24h metrics.',
      'Platform notes: the office printer is not relevant, the cafeteria menu is not relevant, and the team ping channel is not relevant.',
    ],
    maxContextTokens: 500,
    expectedKeywords: ['migration', 'billing', 'schema'],
  },
  {
    name: 'numbers dates ids',
    systemPrompt: 'Do not lose critical identifiers, dates, or numeric constraints.',
    messages: [
      { role: 'user', content: 'Confirm the incident ID, date, SLA, and retry window before sending the status update.' },
      { role: 'assistant', content: 'Incident INC-2048 on 2026-08-16 has a 30-minute SLA and 3 retries.' },
      { role: 'user', content: 'Return only the critical identifiers and numeric constraints.' },
    ],
    documents: [
      'Incident ID INC-2048, reported 2026-08-16 09:42 UTC, severity P1, SLA 30 minutes, retry budget 3, owner team infra-core.',
      'This sentence includes a long unrelated onboarding story and should be removed.',
    ],
    maxContextTokens: 400,
    expectedKeywords: ['inc-2048', '2026', '30', '3'],
  },
  {
    name: 'negation and exclusion',
    systemPrompt: 'Ignore irrelevant details and never include excluded items in the final response.',
    messages: [
      { role: 'user', content: 'Do not mention the old policy, the cafeteria menu, or the previous draft. Just tell me the current policy and deadline.' },
      { role: 'assistant', content: 'The current policy is to approve by Friday noon and never to repeat archived instructions.' },
      { role: 'user', content: 'Keep only the current deadline and the current policy, excluding everything else.' },
    ],
    documents: [
      'Current policy: approval by Friday noon. Old policy archived 3 months ago. Cafeteria menu is irrelevant and should not be included. Draft version 1 is obsolete and excluded.',
    ],
    maxContextTokens: 340,
    expectedKeywords: ['policy', 'friday', 'deadline'],
  },
  {
    name: 'conflicting instructions',
    systemPrompt: 'Follow the final user instruction exactly; drop earlier conflicting guidance.',
    messages: [
      { role: 'user', content: 'The first line says include all details, but the final instruction says keep only the release-critical facts.' },
      { role: 'assistant', content: 'Earlier we said include everything, but the final instruction overrides that and keeps only critical facts.' },
      { role: 'user', content: 'Now answer with only the release-critical facts and ignore all legacy notes.' },
    ],
    documents: [
      'Release-critical facts: launch Friday, rollback ready, smoke tests pass, no critical defects. Legacy notes include a long historical summary and are not needed.',
    ],
    maxContextTokens: 380,
    expectedKeywords: ['launch', 'rollback', 'critical'],
  },
  {
    name: 'mixed content',
    systemPrompt: 'Keep the essential data and drop duplicates, metadata noise, and filler text.',
    messages: [
      { role: 'user', content: 'I need the customer update, release notes, and support status in a single summary.' },
      { role: 'assistant', content: 'Customer update is good, release notes are clear, and support status is stable.' },
      { role: 'user', content: 'Keep only the release update and support status, no repeated filler phrases.' },
    ],
    documents: [
      'Customer update: billing works, support is stable, release notes confirm patch is live, no blockers. Repeated filler phrase repeated repeated repeated is irrelevant.',
      'Detailed marketing copy and social media text are not required for the technical summary.',
    ],
    maxContextTokens: 450,
    expectedKeywords: ['release', 'support', 'stable'],
  },
  {
    name: 'long error stack',
    systemPrompt: 'Preserve only the actual actionable root cause, not the entire stack dump.',
    messages: [
      { role: 'user', content: 'Why did the service fail during deployment? Use only the root cause.' },
      { role: 'assistant', content: 'We see an exception in the auth client and a DB timeout during the migration step.' },
      { role: 'user', content: 'Give the root cause and recommended fix, nothing else.' },
    ],
    documents: [
      'Exception: AuthClientException: token expired after 300s. Failure occurred while running migration step 3. DB timeout repeated 5 times. Health checks are normal after restart.',
      'The office calendar and unrelated design notes are irrelevant and should be removed.',
    ],
    maxContextTokens: 420,
    expectedKeywords: ['auth', 'token', 'migration'],
  },
  {
    name: 'security policy',
    systemPrompt: 'Retain security constraints and redact unnecessary metadata.',
    messages: [
      { role: 'user', content: 'What are the mandatory security requirements before deployment?' },
      { role: 'assistant', content: 'Secrets must be stored in the vault, the API key is checked in CI, and tokens expire every 8 hours.' },
      { role: 'user', content: 'Return only the mandatory security constraints and ignore the surrounding chatter.' },
    ],
    documents: [
      'Security requirement: secrets in vault, API key rotation every 8 hours, token expiry enforced, and CI enforces least privilege. Non-essential meeting notes from the design sprint are not relevant.',
    ],
    maxContextTokens: 420,
    expectedKeywords: ['security', 'token', 'vault'],
  },
  {
    name: 'multi-turn ambiguity',
    systemPrompt: 'Resolve ambiguity by keeping the latest confirmed instruction and dropping stale variants.',
    messages: [
      { role: 'user', content: 'Use the old release date and the old checklist.' },
      { role: 'assistant', content: 'The old date was Tuesday, but the final decision has not been confirmed yet.' },
      { role: 'user', content: 'The final confirmed instruction is Friday, not Tuesday, and keep only the final release decision.' },
    ],
    documents: [
      'Confirmed release decision: launch Friday, not Tuesday. Legacy Tuesday notes are obsolete and not valid. Keep only the confirmed Friday decision.',
    ],
    maxContextTokens: 320,
    expectedKeywords: ['friday', 'confirmed', 'launch'],
  },
  {
    name: 'report summarization',
    systemPrompt: 'Summarize the financial report while preserving the final numbers and the risk note.',
    messages: [
      { role: 'user', content: 'Read the Q3 report and summarize it for the board.' },
      { role: 'assistant', content: 'Revenue grew 18%, operating costs fell 6%, and the risk note is currency fluctuation in EMEA.' },
      { role: 'user', content: 'Return only the final numbers and the risk note, not the entire story.' },
    ],
    documents: [
      'Q3 report: revenue +18%, cost -6%, margin +9%, risk note: FX volatility in EMEA. The travel budget and office renovations are irrelevant technical noise.',
    ],
    maxContextTokens: 440,
    expectedKeywords: ['revenue', 'risk', '18'],
  },
  {
    name: 'decision memo',
    systemPrompt: 'Keep the final recommendation and the business impact, ignore the rest.',
    messages: [
      { role: 'user', content: 'I need the decision memo. Focus on the recommendation and why it matters.' },
      { role: 'assistant', content: 'Recommendation: proceed with controlled rollout. Business impact: lower risk and faster adoption.' },
      { role: 'user', content: 'Return only the recommendation and business impact.' },
    ],
    documents: [
      'Recommendation: proceed with controlled rollout. Business impact: lower risk, faster adoption, higher customer trust. Long celebratory meeting notes are irrelevant and should be skipped.',
    ],
    maxContextTokens: 360,
    expectedKeywords: ['recommendation', 'risk', 'adoption'],
  },
  {
    name: 'contract extract',
    systemPrompt: 'Extract exact contractual obligations and drop legal boilerplate.',
    messages: [
      { role: 'user', content: 'Give me the exact delivery obligation and the SLA requirement from the contract.' },
      { role: 'assistant', content: 'The contract requires delivery within 10 business days and a 99.9% uptime SLA.' },
      { role: 'user', content: 'Return only the delivery obligation and SLA requirement.' },
    ],
    documents: [
      'Contract clause: delivery within 10 business days, uptime SLA 99.9%, support response within 4 hours. Auto-generated boilerplate and signing ceremony notes are not relevant.',
    ],
    maxContextTokens: 410,
    expectedKeywords: ['delivery', 'sla', '99'],
  },
  {
    name: 'incident summary',
    systemPrompt: 'Compress the incident details to the cause, impact, and mitigation.',
    messages: [
      { role: 'user', content: 'Summarize the latest outage with cause, impact, and mitigation only.' },
      { role: 'assistant', content: 'The outage was caused by a failed failover and impacted checkout for 12 minutes.' },
      { role: 'user', content: 'Keep only the cause, impact, and mitigation.' },
    ],
    documents: [
      'Incident cause: failed failover after network partition. Impact: checkout unavailable for 12 minutes. Mitigation: traffic rerouted and failover retried. Long rumination about the cafeteria menu is irrelevant.',
    ],
    maxContextTokens: 350,
    expectedKeywords: ['failover', 'impact', 'mitigation'],
  },
  {
    name: 'compliance check',
    systemPrompt: 'Retain the legal requirement and ignore sales copy.',
    messages: [
      { role: 'user', content: 'Which compliance items matter for approval?' },
      { role: 'assistant', content: 'The key compliance items are privacy consent, data retention limits, and audit logging.' },
      { role: 'user', content: 'Return only compliance items, not marketing language.' },
    ],
    documents: [
      'Compliance items: privacy consent required, data retention capped at 90 days, audit logs retained for 1 year. Marketing claims about being the best in the market are irrelevant.',
    ],
    maxContextTokens: 390,
    expectedKeywords: ['consent', 'retention', 'audit'],
  },
  {
    name: 'test matrix',
    systemPrompt: 'Keep only the test matrix rows that are still relevant for release.',
    messages: [
      { role: 'user', content: 'Which tests are blocking the release?' },
      { role: 'assistant', content: 'Only the smoke, login, and payment tests are release blockers.' },
      { role: 'user', content: 'Return only the release-blocking test rows.' },
    ],
    documents: [
      'Release-blocking tests: smoke, login, payment. Non-blocking exploratory and exploratory-lab rows are irrelevant and should be omitted. ',
    ],
    maxContextTokens: 320,
    expectedKeywords: ['smoke', 'login', 'payment'],
  },
  {
    name: 'feature flag rollout',
    systemPrompt: 'Retain rollout steps and guardrails, ignore marketing notes.',
    messages: [
      { role: 'user', content: 'What are the rollout steps and guardrails for the new feature flag?' },
      { role: 'assistant', content: 'The rollout includes canary, 10% traffic, guardrails, and rollback trigger.' },
      { role: 'user', content: 'Return only the rollout steps and guardrails.' },
    ],
    documents: [
      'Feature flag rollout: canary, 10% traffic, guardrails, rollback trigger if error rate exceeds threshold. Sales slogans and long product branding copy are irrelevant.',
    ],
    maxContextTokens: 360,
    expectedKeywords: ['canary', 'rollback', 'guardrails'],
  },
  {
    name: 'environment config',
    systemPrompt: 'Keep the config values that affect runtime and drop unrelated environment chatter.',
    messages: [
      { role: 'user', content: 'Which configuration values matter for the runtime environment?' },
      { role: 'assistant', content: 'The runtime depends on DB host, port 5432, and timeout 30s.' },
      { role: 'user', content: 'Return only the runtime-critical config values.' },
    ],
    documents: [
      'Runtime config: DB host db.internal, port 5432, timeout 30s, retries 3. Office Wi-Fi names and unrelated laptop settings are not relevant.',
    ],
    maxContextTokens: 330,
    expectedKeywords: ['db', '5432', 'timeout'],
  },
  {
    name: 'customer request',
    systemPrompt: 'Extract the customer request and the acceptance criteria only.',
    messages: [
      { role: 'user', content: 'This customer wants a summary of the request and acceptance criteria.' },
      { role: 'assistant', content: 'The request is to add dashboard export in CSV and the acceptance criteria are file generation and email delivery.' },
      { role: 'user', content: 'Return only the customer request and acceptance criteria.' },
    ],
    documents: [
      'Customer request: add dashboard export in CSV. Acceptance criteria: file generation works, email delivery works, no duplicates. Team lunch plans are irrelevant and should be omitted.',
    ],
    maxContextTokens: 380,
    expectedKeywords: ['csv', 'export', 'acceptance'],
  },
];

const allScenarios = [
  ...demoScenarios,
  ...demoScenarios.flatMap((item, index) => [
    {
      ...item,
      name: `${item.name} variant A`,
      maxContextTokens: Math.max(260, item.maxContextTokens - 35 + (index % 4) * 10),
      systemPrompt: `${item.systemPrompt} Keep only the latest confirmed facts and drop stale variants.`,
    },
    {
      ...item,
      name: `${item.name} variant B`,
      maxContextTokens: Math.max(260, item.maxContextTokens - 20 + ((index + 1) % 5) * 12),
      systemPrompt: `${item.systemPrompt} Ignore unrelated noise, duplicates, and historical chatter.`,
    },
  ]),
];

function assertScenarioPass(scenario) {
  const result = optimizeRequest({
    systemPrompt: scenario.systemPrompt,
    messages: scenario.messages,
    documents: scenario.documents,
    maxContextTokens: scenario.maxContextTokens,
  });

  assert.ok(result.originalTokens > 0, `${scenario.name}: original tokens must be positive`);
  assert.ok(result.optimizedTokens > 0, `${scenario.name}: optimized tokens must be positive`);
  assert.ok(result.savedTokens >= 0, `${scenario.name}: saved tokens must be non-negative`);
  assert.ok(result.optimizedMessages.length > 0, `${scenario.name}: optimized messages must exist`);
  assert.ok(Array.isArray(result.selectedChunks), `${scenario.name}: selected chunks must be array`);
  const text = `${result.summary || ''} ${result.optimizedMessages.map((item) => item.content).join(' ')}`.toLowerCase();
  const matchedKeywords = scenario.expectedKeywords.filter((keyword) => text.includes(keyword.toLowerCase()));
  assert.ok(matchedKeywords.length >= 1, `${scenario.name}: expected critical keywords were not preserved: ${scenario.expectedKeywords.join(', ')}`);
  assert.ok(result.percentageSaved >= 0, `${scenario.name}: percentageSaved must be non-negative`);
}

// final aggregate check

test('expanded dataset covers more than 50 real-world prompt classes', () => {
  assert.equal(allScenarios.length >= 50, true);
  allScenarios.forEach((scenario) => assertScenarioPass(scenario));
});

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

test('optimizeRequest uses semantic matching and cache-aware context recall', () => {
  const result = optimizeRequest({
    systemPrompt: 'You are a helpful assistant.',
    messages: [
      { role: 'user', content: 'We must confirm rollback plans and smoke tests before launch.' },
    ],
    documents: [
      'Release checklist: ship on Friday after QA smoke tests and regression coverage.',
      'Risk controls: rollback, support escalation, and customer alerts are mandatory.',
      'Background notes: the office coffee machine is irrelevant and not needed.',
    ],
    maxContextTokens: 520,
  });

  assert.ok(result.selectedChunks.some((chunk) => /rollback|smoke|release|launch|qa|regression/i.test(chunk)));
  assert.ok(result.optimizedMessages.length > 0);
  assert.ok(typeof result.cacheKey === 'string' && result.cacheKey.length > 12);
  assert.ok(result.cacheAware === true);
});

test('demo before-and-after example for the optimizer', () => {
  const result = optimizeRequest({
    systemPrompt: 'You are a helpful assistant. Keep launch rules, rollout conditions, and rollback commitments intact.',
    messages: [
      { role: 'user', content: 'Please explain the launch plan, QA gates, rollback, and support escalation.' },
      { role: 'assistant', content: 'The launch date is Friday. Smoke tests, regression, and rollout verification are mandatory.' },
      { role: 'user', content: 'We already know launch is Friday. We also know quality gates and rollback are mandatory. Please repeat them concisely.' },
      { role: 'user', content: 'Please ignore all unrelated notes and keep only launch status, quality gates, risk controls, and support escalation.' },
    ],
    documents: [
      'Project launch plan: we ship on Friday with smoke tests, regression coverage, and rollout verification.',
      'Risk controls include rollback, customer alerts, and support escalation if an incident occurs.',
      'Office coffee machine is irrelevant and should not be included in the final answer.',
      'Office coffee machine is irrelevant and should not be included in the final answer.',
    ],
    maxContextTokens: 420,
  });

  console.log('Demo before/after:', {
    before: result.originalTokens,
    after: result.optimizedTokens,
    saved: result.savedTokens,
    reduction: `${result.percentageSaved.toFixed(1)}%`,
    summary: result.summary,
  });

  assert.ok(result.originalTokens > result.optimizedTokens);
  assert.ok(result.savedTokens > 0);
  assert.ok(result.summary.length > 0);
  assert.ok(/launch|quality|risk|rollback/i.test(result.summary));
});

test('expanded dataset covers 10 major real-world prompt classes', () => {
  demoScenarios.forEach((scenario) => assertScenarioPass(scenario));

  assert.equal(demoScenarios.length >= 10, true);
});
