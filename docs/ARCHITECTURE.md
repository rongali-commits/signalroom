# SignalRoom architecture

## Application surface

SignalRoom uses a Next.js App Router interface built for Cloudflare Workers through Vinext. The product opens directly into the working research surface. The five primary views share one evidence context:

1. Overview summarizes research health.
2. Evidence exposes the original customer language.
3. Themes groups repeated needs and tracks their strength.
4. Opportunities turns supported themes into decision candidates.
5. Reports packages evidence and recommendations for stakeholders.

## Analysis request

The browser sends a bounded research question and the current evidence set to `/api/analyze`. The server validates the origin, content type, request size, evidence count, and individual field lengths before contacting DeepSeek.

The model receives a strict system instruction and numbered evidence items. Customer text is explicitly treated as untrusted quoted material. The response must cite evidence as `[E1]`, `[E2]`, and so on. No provider key is shipped to the browser.

## Abuse controls

D1 stores only expiring usage buckets. A daily salted hash derived from the server key and visitor IP prevents raw IP storage. Atomic SQLite updates enforce minute, daily visitor, and daily global limits. Expired buckets are removed during later analysis requests.

## Data boundary

CSV imports remain in the active browser session in this release. The public workspace therefore cannot write customer content into a shared global database. A client deployment can add authenticated, tenant-owned persistence without changing the analysis contract.

## Deployment

The hosting manifest declares D1 as `DB`. Production deployments require `DEEPSEEK_API_KEY` and may set `DEEPSEEK_MODEL`. Drizzle migrations create the usage-control table and its expiry index before the Worker is published.
