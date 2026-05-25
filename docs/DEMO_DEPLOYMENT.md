# Demo deployment

Navis Docs runs the public demo on a **separate Vercel project** and **separate Postgres database** from production. Production embeds the demo in a marketing iframe; it never enables demo auth bypass.

See [SELF_HOSTING.md](../SELF_HOSTING.md) for single-tenant self-hosting. This document is for operators running the hosted demo at `demo.navisdocs.com`.

## Architecture

| Project    | Domain                         | Database            | Demo env vars                                                |
| ---------- | ------------------------------ | ------------------- | ------------------------------------------------------------ |
| Production | `app.navisdocs.com`, marketing | Production Postgres | **None** (only `NEXT_PUBLIC_DEMO_URL` for iframe)            |
| Demo       | `demo.navisdocs.com`           | Demo Postgres only  | `NEXT_PUBLIC_DEMO_*` + `DEMO_*` (not `NEXT_PUBLIC_DEMO_URL`) |

**Rule:** Production must never set `NEXT_PUBLIC_DEMO_MODE`, `NEXT_PUBLIC_DEMO_HOST`, or `DEMO_*`. The demo project must never share `DATABASE_URL`, `REDIS_URL`, or storage buckets with production.

Build-time validation in `src/lib/demo-env.ts` (imported from `next.config.ts`) throws if these rules are violated.

## Production Vercel project

Set:

- `NEXT_PUBLIC_APP_URL` — production app URL
- `NEXT_PUBLIC_DEMO_URL` — `https://demo.navisdocs.com` (marketing iframe base URL; appends `/dashboard`)
- Production `DATABASE_URL`, auth, Stripe, Redis, storage, etc.

Do **not** set:

- `NEXT_PUBLIC_DEMO_MODE`
- `NEXT_PUBLIC_DEMO_HOST`
- `DEMO_ORG_ID` / `DEMO_USER_ID` / `DEMO_MEMBER_USER_ID`

## Demo Vercel project

Create a second Vercel project from the same Git repo. Set:

| Variable                | Example                        |
| ----------------------- | ------------------------------ |
| `NEXT_PUBLIC_DEMO_MODE` | `true`                         |
| `NEXT_PUBLIC_DEMO_HOST` | `demo.navisdocs.com`           |
| `NEXT_PUBLIC_APP_URL`   | `https://demo.navisdocs.com`   |
| `DEMO_ORG_ID`           | From seed (stable UUID)        |
| `DEMO_USER_ID`          | From seed (stable UUID)        |
| `DEMO_MEMBER_USER_ID`   | Optional second demo user UUID |
| `DATABASE_URL`          | Demo DB only                   |
| `REDIS_URL`             | Demo Redis                     |
| Storage vars            | Demo buckets                   |
| `AUTH_SECRET`           | Unique secret                  |
| `AUTH_TRUST_HOST`       | `true`                         |

Omit `NEXT_PUBLIC_DEMO_URL` (production marketing iframe only). Omit Stripe live keys, Google OAuth, and platform AI keys unless you need them for testing.

Point DNS `demo.navisdocs.com` at this project only — not at production.

## Initial demo database setup

1. Create a new Postgres project (pgvector enabled).
2. Run migrations:

```bash
DATABASE_URL="postgresql://..." pnpm exec prisma migrate deploy
```

3. Generate stable UUIDs for `DEMO_ORG_ID`, `DEMO_USER_ID`, and optionally `DEMO_MEMBER_USER_ID`.
4. Seed:

```bash
DEMO_ORG_ID=... DEMO_USER_ID=... DEMO_MEMBER_USER_ID=... \
  pnpm exec tsx prisma/seed-demo.ts
```

5. Confirm only demo data exists (`demo-organization` slug, `demo@navisdocs.com` user).

Provision isolated Redis and S3/Supabase buckets for the demo project as well.

## Manual demo reset

Demo data is reset **manually only** — no cron jobs or `/api/cron/*` routes.

When to reset: after testing destructive actions on the demo site, before a demo, or to restore seeded content.

**Never run this against production `DATABASE_URL`.**

```bash
DATABASE_URL="postgresql://...demo..." \
DEMO_ORG_ID=... \
DEMO_USER_ID=... \
DEMO_MEMBER_USER_ID=... \
  pnpm demo:reset
```

Required env vars: `DATABASE_URL`, `DEMO_ORG_ID`, `DEMO_USER_ID` (and `DEMO_MEMBER_USER_ID` if you use a fixed member id).

The script wipes and re-seeds the demo org via `src/lib/demo-reset.ts` and invalidates the demo dashboard cache tag. Users on the live demo site may need a hard refresh if cached pages persist.

## Post-deploy verification

### Production must not enter demo mode

- `/dashboard` on production redirects to sign-in (no synthetic session).
- tRPC without auth returns `UNAUTHORIZED`.
- Build passes without demo env validation errors.

### Demo host is read-only sandbox

On `https://demo.navisdocs.com`:

- `/` redirects to `/dashboard`.
- `/dashboard` loads without sign-in.
- Settings, Invite, Subscription, and procedure edit pages show demo-not-available UI.
- tRPC writes return `FORBIDDEN` / "not available in the demo".

### Iframe embedding

Marketing site iframe loads the demo dashboard (`NEXT_PUBLIC_DEMO_URL` + `/dashboard`). Verify headers:

```bash
curl -sI https://demo.navisdocs.com/dashboard | grep -iE 'x-frame|content-security|x-robots'
```

Demo should return `X-Robots-Tag`, `Content-Security-Policy: frame-ancestors ...`, and no `X-Frame-Options: DENY`. Production URLs should return `X-Frame-Options: DENY`.

Headers are set in `src/proxy.ts` (Next.js 16 — do not add `middleware.ts`).

## Cross-contamination checks

- Demo DB: no production org slugs or user emails.
- Production DB: no `demo-organization` slug or `demo@navisdocs.com` (unless seeded locally on purpose).
