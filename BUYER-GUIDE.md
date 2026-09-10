# SignalRoom buyer guide

SignalRoom is an evidence-first customer research and product intelligence workspace for SaaS teams, agencies, and product consultants. This package includes the complete application source, the DeepSeek analysis workflow, sample customer evidence, database migrations, and Railway deployment configuration.

## What is included

- Responsive research workspace with five working views
- Searchable evidence repository and CSV import
- Theme, opportunity, and stakeholder-report views
- DeepSeek analysis grounded in the evidence supplied by the user
- Inline evidence citations such as `[E1]` and `[E2]`
- Request validation, same-origin protection, rate limits, and provider timeouts
- Railway Docker deployment files
- Sample CSV, architecture notes, and AI safety notes

## Deploy on Railway

1. Create a new Railway project from this repository or source folder.
2. Add the secret variable `DEEPSEEK_API_KEY`.
3. Optionally set `DEEPSEEK_MODEL`. The default is `deepseek-v4-flash`.
4. Deploy. Railway detects `railway.json` and the included `Dockerfile`.
5. Generate a public domain from the service settings.

The application creates and migrates its local rate-limit database when the container starts. Attach a Railway volume at `/data` if rate-limit counters should survive redeployments.

## Local development

1. Install Node.js 22.13 or newer.
2. Run `npm ci`.
3. Copy `.dev.vars.example` to `.dev.vars` and add a funded DeepSeek API key.
4. Run `npm run dev`.
5. Open `http://localhost:5173`.

## Brand and content changes

- Product data and visible workspace content: `app/signalroom-app.tsx`
- Colors, spacing, typography, and responsive rules: `app/globals.css`
- Page title and description: `app/layout.tsx`
- AI prompt, validation, and rate limits: `app/api/analyze/route.ts`
- Database schema: `db/schema.ts`

## Production checklist

- Use a new server-side DeepSeek key for every client deployment.
- Never add the key to client-side code or a public environment variable.
- Replace the supplied workspace content with the buyer's own approved data.
- Confirm the public domain, mobile layout, CSV import, and AI response before launch.
- Review provider usage and rate limits after real traffic begins.

## Support boundary

This source kit includes the application and documentation. Hosting accounts, API usage, custom integrations, large feature additions, and ongoing maintenance are separate unless included in a custom service agreement.

## Package integrity

The downloadable release excludes developer secrets, local databases, build caches, and repository history. Run `scripts/package-release.ps1` from PowerShell to create a clean commercial ZIP in `release-output`.
