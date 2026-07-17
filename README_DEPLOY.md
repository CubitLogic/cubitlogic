# Cubit Logic deployment notes

This archive is patched for safer independent deployment.

## What was fixed

- Removed the hardcoded Stripe webhook secret fallback.
- Stripe checkout now uses the backend checkout session so subscriptions are tied to signed-in users.
- Footer support link now routes to `/pricing` instead of bypassing account linking.
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

## Recommended host

Because this app has an Express backend, tRPC routes, Stripe/PayPal webhooks, AI calls, and a MySQL database, use a full-stack Node host such as Render, Railway, Fly.io, or a VPS. A static-only host is not enough unless you remove/replace the backend features.

`render.yaml` and `Dockerfile` are included as starting points.

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
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `GEMINI_API_KEY`

Do not commit real values. Ever. Secrets in GitHub are just tiny public disasters wearing sunglasses.
