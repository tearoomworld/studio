# Studio

Multi-company solo studio dashboard (Kindred + Source). Next.js 15, Supabase, Anthropic, Resend.

## Quick start (when you're back)

### 1. Database migration

1. Open the file `supabase/migrations/0001_initial.sql` in your editor
2. Copy **all** the SQL (Cmd+A, Cmd+C) — not the filename
3. [Supabase SQL Editor](https://supabase.com/dashboard/project/drfbxbretxiaolgcofhf/sql/new) → paste → **Run**
4. Confirm tables under **Table Editor** (11 tables)

### 2. Service role key (for seed)

1. **Project Settings** → **API** → copy **secret** key
2. Add to `studio/.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

### 3. Auth user + redirect URLs

1. **Authentication** → **Users** → add `hq@tearoom.world` (or your email)
2. **Authentication** → **URL configuration** → **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR_VERCEL_URL/auth/callback` (after deploy)

### 4. Seed data

```bash
cd studio
npm run seed
```

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000 → magic link login.

## Environment variables

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | publishable key OK |
| `SUPABASE_SERVICE_ROLE_KEY` | seed only | never expose to browser |
| `NEXT_PUBLIC_SITE_URL` | yes | `http://localhost:3000` locally |
| `ANTHROPIC_API_KEY` | analyze + ideas | |
| `RESEND_API_KEY` | send email | after domain verified |

## Resend (Kindred email)

Not configured yet. When you have a domain:

1. Add domain in Resend, verify DNS
2. Set `RESEND_API_KEY` in `.env.local`
3. Compose → **Send** uses `hello@kindred.care`

## Deploy (Vercel)

1. Import `studio` folder as Next.js project (root directory: `studio`)
2. Add all env vars from `.env.local.example`
3. Add production URL to Supabase redirect URLs

## Project layout

- `app/` — routes (companies, calendar, operations, ledger, portals)
- `components/` — Sidebar, WeekView, iframes
- `scripts/seed.ts` — idempotent seed from portal HTML
- `public/` — static HTML mocks for portal iframes

## Security note

If you pasted API keys in chat, rotate your Anthropic key in the console.
