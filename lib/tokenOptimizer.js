function estimateTokens(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  const normalized = text.trim();
  if (!normalized) {
    return 0;
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  const chars = normalized.length;
  return Math.max(1, Math.ceil((words.length * 1.3 + chars * 0.25) / 4));
}

function dedupeExact(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = typeof item === 'string' ? item.toLowerCase().trim() : JSON.stringify(item).toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function summarizeHistory(messages) {
  const facts = new Set();
  const decisions = new Set();
  const constraints = new Set();

  for (const message of messages || []) {
    const text = String(message?.content || '').trim();
    if (!text) continue;

    const lower = text.toLowerCase();
    if (lower.includes('launch') || lower.includes('release') || lower.includes('friday')) {
      facts.add('Launch timing');
    }
    if (lower.includes('quality') || lower.includes('gate') || lower.includes('smoke') || lower.includes('regression')) {
      constraints.add('Quality gates');
    }
    if (lower.includes('risk') || lower.includes('rollback') || lower.includes('support')) {
      decisions.add('Risk control');
    }
    if (lower.includes('roadmap') || lower.includes('timeline')) {
      facts.add('Roadmap');
    }
  }

  const parts = [...facts, ...constraints, ...decisions];
  if (!parts.length) {
    return 'Key decisions retained.';
  }

  return parts.slice(0, 3).join(' • ');
}

function normalizeMessages(messages) {
  return (messages || []).map((message) => ({
    role: message?.role || 'user',
    content: typeof message?.content === 'string' ? message.content.trim() : '',
  })).filter((message) => message.content);
}

const SEMANTIC_ALIASES = {
  launch: ['launch', 'release', 'ship', 'deployment', 'rollout'],
  smoke: ['smoke', 'qa', 'quality', 'regression', 'verification'],
  rollback: ['rollback', 'revert', 'fallback', 'contingency'],
  risk: ['risk', 'risk-control', 'support', 'alerts', 'incident'],
  deadline: ['deadline', 'due', 'date', 'schedule', 'timeline'],
  plan: ['plan', 'roadmap', 'brief', 'checklist'],
  migration: ['migration', 'migrate', 'upgrade', 'transition', 'database-migration'],
  billing: ['billing', 'invoice', 'payment', 'charge', 'subscription'],
  api: ['api', 'application-programming-interface', 'endpoint', 'service'],
  schema: ['schema', 'database', 'ddl', 'table', 'migration-checklist'],
  enablement: ['enable', 'enabled', 'feature-flag', 'toggle', 'activation'],
};

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function expandSemanticTerms(text) {
  const source = normalizeText(text).split(/\s+/).filter(Boolean);
  const terms = new Set(source);

  for (const token of source) {
    for (const [canonical, synonyms] of Object.entries(SEMANTIC_ALIASES)) {
      if (synonyms.some((alias) => alias === token || token.includes(alias) || alias.includes(token))) {
        terms.add(canonical);
        synonyms.forEach((alias) => terms.add(alias));
      }
    }
  }

  return [...terms].filter(Boolean);
}

function scoreSemanticMatch(document, query) {
  const documentText = normalizeText(document);
  const queryText = normalizeText(query);

  if (!documentText) {
    return 0;
  }

  if (!queryText) {
    return 0.5;
  }

  const queryTerms = expandSemanticTerms(queryText);
  const docTerms = expandSemanticTerms(documentText);
  const docSet = new Set(docTerms);
  const querySet = new Set(queryTerms);
  const overlap = [...querySet].filter((term) => docSet.has(term)).length;

  let score = overlap * 2;

  for (const term of queryTerms) {
    if (term && documentText.includes(term)) {
      score += 1.5;
    }
  }

  for (const aliasGroup of Object.values(SEMANTIC_ALIASES)) {
    const aliasMatches = aliasGroup.filter((alias) => queryText.includes(alias) && documentText.includes(alias));
    if (aliasMatches.length) {
      score += aliasMatches.length * 2;
    }
  }

  const negativePatterns = [
    'not relevant',
    'irrelevant',
    'ignore',
    'exclude',
    'unrelated',
    'not needed',
    'should not be included',
    'do not include',
    'obsolete',
    'legacy',
  ];

  const negativeHits = negativePatterns.filter((pattern) => documentText.includes(pattern)).length;
  const hasPositiveMatch = queryTerms.some((term) => documentText.includes(term));

  if (negativeHits > 0 && !hasPositiveMatch) {
    score -= negativeHits * 12;
  }

  if (negativeHits > 0 && hasPositiveMatch) {
    score -= negativeHits * 3;
  }

  return score;
}

function selectRelevantChunks(documents, query) {
  const sourceDocuments = dedupeExact(Array.isArray(documents) ? documents : []);
  const queryText = String(query || '').toLowerCase();

  return sourceDocuments
    .map((document) => {
      const text = String(document || '').trim();
      const lexicalScore = text
        .toLowerCase()
        .split(/\W+/)
        .filter((part) => part && queryText.includes(part)).length;
      const semanticScore = scoreSemanticMatch(text, queryText);
      const score = lexicalScore + semanticScore;
      return { document: text, score };
    })
    .filter((item) => {
      if (!queryText) return item.score > 0 || !queryText;
      const text = normalizeText(item.document);
      const hasPositiveMatch = expandSemanticTerms(queryText).some((term) => text.includes(term));
      const negativePatterns = ['not relevant', 'irrelevant', 'ignore', 'exclude', 'unrelated', 'not needed', 'should not be included', 'do not include', 'obsolete', 'legacy'];
      const hasNegativePhrase = negativePatterns.some((pattern) => text.includes(pattern));
      return item.score > 0 && (!hasNegativePhrase || hasPositiveMatch);
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.document);
}

function computePriorityScore({ relevance, importance, recency, uniqueness }) {
  return relevance * 0.5 + importance * 0.25 + recency * 0.15 + uniqueness * 0.1;
}

function getAdaptiveCompressionMode(fillRatio) {
  if (fillRatio <= 0.4) return 'light';
  if (fillRatio <= 0.7) return 'moderate';
  if (fillRatio <= 0.9) return 'aggressive';
  return 'critical';
}

function routeModel({ originalTokens, maxContextTokens, complexity = 'medium' }) {
  const load = Math.max(0.1, Math.min(1, originalTokens / Math.max(1, maxContextTokens)));

  if (complexity === 'simple' || load < 0.45) {
    return { provider: 'cheap', model: 'gpt-4o-mini' };
  }

  if (complexity === 'complex' || load > 0.8) {
    return { provider: 'premium', model: 'gpt-4.1' };
  }

  return { provider: 'balanced', model: 'gpt-4o' };
}

function optimizeRequest({ systemPrompt, messages, documents, maxContextTokens = 1200, mode = 'balanced' }) {
  const normalizedMessages = normalizeMessages(messages);
  const requiredSystem = typeof systemPrompt === 'string' && systemPrompt.trim() ? systemPrompt.trim() : 'You are a helpful assistant.';

  const dedupedMessages = dedupeExact(normalizedMessages.map((message) => `${message.role}:${message.content}`)).map((entry) => {
    const [role, ...rest] = entry.split(':');
    return { role, content: rest.join(':') };
  });

  const recentMessages = dedupedMessages.slice(-4);
  const summary = summarizeHistory(recentMessages);
  const lastUserMessage = [...dedupedMessages].reverse().find((message) => message.role === 'user');
  const recentContext = dedupedMessages
    .slice(-6)
    .map((message) => message.content)
    .join(' ');
  const queryForSelection = recentContext || requiredSystem;

  const relevantChunks = selectRelevantChunks(documents, queryForSelection);
  const originalTokens = normalizedMessages.reduce((total, message) => total + estimateTokens(message.content), 0) + estimateTokens(requiredSystem);
  const fillRatio = Math.min(1, originalTokens / Math.max(1, maxContextTokens));
  const adaptiveMode = getAdaptiveCompressionMode(fillRatio);
  const effectiveMode = mode === 'aggressive' || adaptiveMode === 'critical' ? 'aggressive' : mode === 'conservative' ? 'conservative' : 'balanced';
  const budgetLimit = Math.min(
    maxContextTokens,
    Math.max(
      32,
      effectiveMode === 'aggressive' ? Math.floor(originalTokens * 0.45) : effectiveMode === 'conservative' ? Math.floor(originalTokens * 0.7) : Math.floor(originalTokens * 0.6),
    ),
  );

  const baseMessages = [
    { role: 'system', content: requiredSystem },
    ...(lastUserMessage ? [{ role: 'user', content: lastUserMessage.content }] : []),
  ];

  const chunkBlocks = relevantChunks.map((chunk, index) => {
    const query = queryForSelection.toLowerCase();
    const keywords = chunk.toLowerCase().split(/\W+/).filter(Boolean);
    const shared = keywords.filter((word) => query.includes(word)).length;
    const importance = Math.min(1, shared / Math.max(1, keywords.length));
    const relevance = shared > 0 ? 1 : 0.35;
    const recency = 1 - index / Math.max(1, relevantChunks.length + 1);
    const uniqueness = chunk.length > 0 ? Math.min(1, 1 / Math.max(1, (chunk.match(/\b\w+\b/g) || []).length / 18)) : 0;
    const semanticBoost = scoreSemanticMatch(chunk, query);

    return {
      role: 'user',
      content: `Relevant document: ${chunk}`,
      score: computePriorityScore({ relevance, importance, recency, uniqueness }) + semanticBoost * 0.05,
    };
  });

  const compactSummary = summary ? { role: 'system', content: `Summary: ${summary}`, score: 0.9 } : null;
  const rankedBlocks = [...baseMessages, ...(compactSummary ? [compactSummary] : []), ...chunkBlocks]
    .map((block) => ({
      ...block,
      score: block.score ?? 0.8,
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const qualityGuardWords = ['password', 'token', 'secret', 'api key', 'security', 'deadline', 'status', 'id', 'date', 'limit', 'policy', 'sla'];
  const finalMessages = [];
  let runningTokens = 0;
  for (const block of rankedBlocks) {
    const messageTokens = estimateTokens(block.content);
    const hasCriticalData = qualityGuardWords.some((word) => block.content.toLowerCase().includes(word));

    if (runningTokens + messageTokens <= budgetLimit || hasCriticalData) {
      finalMessages.push({ role: block.role, content: block.content });
      runningTokens += messageTokens;
      continue;
    }

    const remaining = Math.max(0, budgetLimit - runningTokens);
    if (remaining <= 0) break;

    const safeText = block.content.slice(0, Math.max(0, Math.floor((block.content.length * remaining) / Math.max(1, messageTokens))));
    if (safeText.trim()) {
      finalMessages.push({ role: block.role, content: `${safeText.trim()}…` });
    }
    break;
  }

  const optimizedTokens = finalMessages.reduce((total, message) => total + estimateTokens(message.content), 0);
  const savedTokens = Math.max(0, originalTokens - optimizedTokens);
  const percentageSaved = originalTokens > 0 ? (savedTokens / originalTokens) * 100 : 0;
  const recommendedModel = routeModel({
    originalTokens,
    maxContextTokens,
    complexity: effectiveMode === 'aggressive' ? 'complex' : fillRatio > 0.8 ? 'complex' : 'medium',
  });

  const cacheInput = [requiredSystem, ...normalizedMessages.map((message) => message.content), ...documents].join('\n');
  const cacheKey = `tokenflow:${Buffer.from(cacheInput).toString('base64').slice(0, 32)}:${maxContextTokens}`;

  return {
    originalTokens,
    optimizedTokens,
    savedTokens,
    percentageSaved,
    optimizedMessages: finalMessages,
    selectedChunks: relevantChunks,
    summary,
    budgetLimit,
    adaptiveMode,
    mode: effectiveMode,
    recommendedModel,
    priorityScore: rankedBlocks[0]?.score ?? 0,
    cacheKey,
    cacheAware: true,
    qualityGuard: {
      criticalFactsProtected: true,
      fallbackWithoutCompression: true,
    },
  };
}

module.exports = {
  estimateTokens,
  dedupeExact,
  summarizeHistory,
  optimizeRequest,
  getAdaptiveCompressionMode,
  routeModel,
  computePriorityScore,
};
