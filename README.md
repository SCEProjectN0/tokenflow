# TokenFlow

Reduce LLM token usage without sacrificing context quality.

## Demo

- Before: 57 tokens
- After: 34 tokens
- Reduction: 40.4%
- Tests: 5/5 passed

## Why it matters

TokenFlow is a lightweight optimization layer for LLM prompts and agent workflows. It removes duplicates, preserves critical instructions, ranks relevant context, and compresses history without losing the facts that matter.

## Included checks

- Context compression
- Relevant fact preservation
- Token usage analytics
- Quality-aware optimization

## Quick start

```bash
npm install
npm run dev
```

Then open:

- http://localhost:3000/
- http://localhost:3000/token-optimizer
- http://localhost:3000/agent

## Project architecture

```text
tokenflow/
├── README.md
├── LICENSE
├── .gitignore
├── package.json
├── src/
├── tests/
├── docs/
├── examples/
├── app/
├── lib/
├── data/
├── public/
└── .github/
    └── workflows/
```

## What the optimizer does

- Deduplicates repeated prompt content
- Summarizes long conversation history
- Selects the most relevant document chunks
- Applies budget-aware pruning
- Routes requests to the right model class
- Emits optimization metrics

## Validation

```bash
node --test lib/tokenOptimizer.test.js
npm run build
```

## License

MIT
