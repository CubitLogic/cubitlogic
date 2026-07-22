# Cubit Logic deployment notes

This archive is patched for safer independent deployment.

## What was fixed

- Removed the hardcoded Stripe webhook secret fallback.
- Stripe checkout now creates a clearly labeled voluntary $5 monthly donation and works without a CubitLogic account.
- Stripe and PayPal donations do not grant membership, unlock content, or change AI Tutor limits.
- Footer and navigation support links now route to `/support`; the old `/pricing` route remains available only for compatibility.
- Replaced Manus storage image references with local `/assets/...` files.
- Added optimized local logo, favicon, hero background, and social card assets.
- Added Open Graph/Twitter metadata, `robots.txt`, and `sitemap.xml`.
- Removed a broken placeholder analytics script from `client/index.html`.
- Added `prefers-reduced-motion` handling and `aria-hidden` to the decorative particle canvas.
- Added `.env.example`.

## Install and build

```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install --frozen-lockfile
pnpm run check
pnpm run build
```

## Run locally

```bash
cp .env.example .env
# Fill in env values, then:
pnpm dev
```

## Production start

```bash
pnpm run build
pnpm start
```

## Important

Rotate the Stripe webhook secret that appeared in the original export. Do not reuse it.

The AI Tutor supports Gemini's OpenAI-compatible API. Add `GEMINI_API_KEY` in
your host's secrets panel to use Gemini Flash Lite; the key is never sent to a
browser. Anonymous visitors are limited server-side to five questions per day
per IP hash, with an eight-second cooldown. That limiter is in-memory, so use
Redis or a database-backed limiter if the app is later scaled to multiple
instances.

For a reversible Microsoft Foundry trial, add these **GoDaddy secrets** (never
to the browser or GitHub):

- `FOUNDRY_PROJECT_ENDPOINT` — the endpoint copied from the Foundry project
  Overview page, such as `https://YOUR-RESOURCE.services.ai.azure.com/api/projects/YOUR-PROJECT`
- `FOUNDRY_API_KEY` — an API key for that Foundry resource
- `FOUNDRY_MODEL` — the deployed model name
- `CUBIT_AI_DAILY_REQUEST_LIMIT=25` — adjust lower for an initial trial
- `CUBIT_AI_MAX_OUTPUT_TOKENS=600` — keeps answers concise and costs bounded

When those three Foundry values are present, CubitAI uses Foundry's
OpenAI-compatible Responses API. The visible page does not change. To stop all
Foundry/Gemini calls immediately, set `CUBIT_AI_ENABLED=false` in GoDaddy and
redeploy; the chat displays its existing CubitLogic.com fallback instead. The
application cap is per running app process and is not a substitute for an Azure
Cost Management budget and alert.

To use the existing **QubitAI Foundry agent itself** instead of calling a model
directly, use its active Responses-protocol endpoint and a non-personal server
identity:

- `FOUNDRY_AGENT_RESPONSES_ENDPOINT` — copy this from Foundry → QubitAI →
  Details → Responses protocol.
- `FOUNDRY_TENANT_ID`, `FOUNDRY_CLIENT_ID`, and `FOUNDRY_CLIENT_SECRET` — an
  existing Microsoft Entra application identity used by GoDaddy, assigned the
  **Foundry Agent Consumer** role on the Foundry project.

The agent endpoint is the more faithful option: it runs the agent's own Foundry
instructions and configuration. CubitLogic obtains a short-lived Entra access
token server-side, never in a visitor's browser. Do not use a personal login
token; it expires and would tie production traffic to your account. If these
agent values are absent, the app keeps using the configured Gemini/Azure model
provider instead.

## Current host

The production site runs as a full-stack Node app in GoDaddy Web Apps. A static-only host is not enough because the app includes an Express backend, tRPC routes, Stripe/PayPal webhooks, AI calls, and a MySQL database.

## Verification status

Validated locally on Windows with Node.js 24.18.0 and the repository-pinned
pnpm 10.4.1 on July 16, 2026. `pnpm check`, `pnpm test`, and `pnpm build`
all pass. Repeat these commands on the production host before pointing live
traffic at it.

## Still needs real configuration

Set these in your host's environment/secrets panel:

- `DATABASE_URL`
- `JWT_SECRET`
- `VITE_APP_ID`
- `VITE_OAUTH_PORTAL_URL`
- `OAUTH_SERVER_URL`
- `OWNER_OPEN_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `GEMINI_API_KEY`

For Azure Foundry / Azure OpenAI instead of Gemini, set these GoDaddy secrets:

- `AZURE_OPENAI_ENDPOINT` (the OpenAI-compatible base endpoint ending in `/openai/v1`)
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT`

Do not set both `LLM_API_KEY` and `AZURE_OPENAI_API_KEY` unless you explicitly
want the generic `LLM_*` settings to take precedence.

Do not commit real values. Ever. Secrets in GitHub are just tiny public disasters wearing sunglasses.
