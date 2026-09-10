# SignalRoom

SignalRoom is an evidence-first customer research and product intelligence workspace for SaaS teams and agencies. It turns interviews, support conversations, surveys, and reviews into traceable themes, prioritized opportunities, and shareable decision briefs.

## Product principles

- Every AI statement should be traceable to customer evidence.
- Recommendations are separated from observations.
- Important decisions remain under human control.
- Confidence reflects evidence coverage, not artificial certainty.
- Customer text is treated as untrusted content, never as system instructions.

## Included workflows

- Research overview with evidence health and emerging themes
- Searchable evidence repository and segment filters
- Theme signal map with confidence and supporting mentions
- Opportunity scoring and decision briefs
- Stakeholder report workspace
- CSV evidence import for up to 50 rows per session
- DeepSeek-powered analysis with inline evidence citations
- Request size limits, same-origin checks, timeouts, and D1 usage controls
- Responsive navigation and reduced-motion support
- WebMCP research theme search action

## Local development

Requirements: Node.js 22.13 or newer.

1. Install the locked dependencies with `npm run install:ci`.
2. Copy `.dev.vars.example` to `.dev.vars` and add a funded DeepSeek API key.
3. Generate migrations with `npm run db:generate` after schema changes.
4. Build once, then apply pending migrations using the commands documented in the Sites starter guidance.
5. Start the workspace with `npm run dev`.

## Environment variables

- `DEEPSEEK_API_KEY`: required, server-side only
- `DEEPSEEK_MODEL`: optional, defaults to `deepseek-v4-flash`

Never expose either value through a public environment variable or client bundle.

## CSV format

The first row must use this order:

```csv
quote,person,company,source,segment
```

A buyer-ready example is included in `sample-data/customer-evidence.csv`.

## Verification

Run these checks before release:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- Verify valid, insufficient-evidence, prompt-injection, cross-origin, oversized-request, provider-error, and rate-limit behavior.
- Check navigation, import, analysis, theme selection, and responsive layouts.

See `docs/ARCHITECTURE.md` and `docs/AI-SAFETY.md` for implementation and safety decisions.
