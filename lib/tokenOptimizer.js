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

function selectRelevantChunks(documents, query) {
  const sourceDocuments = dedupeExact(Array.isArray(documents) ? documents : []);
  const queryText = String(query || '').toLowerCase();

  return sourceDocuments
    .map((document) => {
      const text = String(document || '').trim();
      const score = text
        .toLowerCase()
        .split(/\W+/)
        .filter((part) => part && queryText.includes(part)).length;

      return { document: text, score };
    })
    .filter((item) => item.score > 0 || !queryText)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.document);
}

function optimizeRequest({ systemPrompt, messages, documents, maxContextTokens = 1200 }) {
  const normalizedMessages = normalizeMessages(messages);
  const requiredSystem = typeof systemPrompt === 'string' && systemPrompt.trim() ? systemPrompt.trim() : 'You are a helpful assistant.';

  const dedupedMessages = dedupeExact(normalizedMessages.map((message) => `${message.role}:${message.content}`)).map((entry) => {
    const [role, ...rest] = entry.split(':');
    return { role, content: rest.join(':') };
  });

  const recentMessages = dedupedMessages.slice(-4);
  const summary = summarizeHistory(recentMessages);
  const lastUserMessage = [...dedupedMessages].reverse().find((message) => message.role === 'user');

  const relevantChunks = selectRelevantChunks(documents, lastUserMessage?.content || requiredSystem);
  const originalTokens = normalizedMessages.reduce((total, message) => total + estimateTokens(message.content), 0) + estimateTokens(requiredSystem);
  const budgetLimit = Math.min(maxContextTokens, Math.max(32, Math.floor(originalTokens * 0.6)));

  const baseMessages = [
    { role: 'system', content: requiredSystem },
    ...(lastUserMessage ? [{ role: 'user', content: lastUserMessage.content }] : []),
  ];

  const compactSummary = summary ? { role: 'system', content: `Summary: ${summary}` } : null;
  const chunkMessages = relevantChunks.slice(0, 1).map((chunk) => ({ role: 'user', content: `Relevant document: ${chunk}` }));

  const finalMessages = [];
  let runningTokens = 0;

  for (const message of [...baseMessages, ...(compactSummary ? [compactSummary] : []), ...chunkMessages]) {
    const messageTokens = estimateTokens(message.content);
    if (runningTokens + messageTokens <= budgetLimit) {
      finalMessages.push(message);
      runningTokens += messageTokens;
      continue;
    }

    const remaining = Math.max(0, budgetLimit - runningTokens);
    if (remaining <= 0) {
      break;
    }

    const safeText = message.content.slice(0, Math.max(0, Math.floor((message.content.length * remaining) / Math.max(1, messageTokens))));
    if (safeText.trim()) {
      finalMessages.push({ ...message, content: `${safeText.trim()}…` });
    }
    break;
  }

  const optimizedTokens = finalMessages.reduce((total, message) => total + estimateTokens(message.content), 0);
  const savedTokens = Math.max(0, originalTokens - optimizedTokens);
  const percentageSaved = originalTokens > 0 ? (savedTokens / originalTokens) * 100 : 0;

  return {
    originalTokens,
    optimizedTokens,
    savedTokens,
    percentageSaved,
    optimizedMessages: finalMessages,
    selectedChunks: relevantChunks,
    summary,
    budgetLimit: budgetLimit,
  };
}

module.exports = {
  estimateTokens,
  dedupeExact,
  summarizeHistory,
  optimizeRequest,
};
