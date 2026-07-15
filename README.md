# Pipeline Academy

Pipeline Academy is an interactive CI/CD learning platform for new developers. It combines a guided course, progress dashboard, quizzes, a pipeline simulator, glossary, challenge workspace, and demo instructor/admin surfaces.

## Production stack

- Next.js App Router on Vercel
- Supabase passwordless authentication
- Supabase Postgres with Row Level Security
- React 19, TypeScript, Zod, Monaco, Recharts, and Framer Motion

Public course pages work without an account. Student workspaces require a secure email sign-in link. Lesson completion, notes, challenge drafts, and submission history follow the student between devices.

## Local development

Requirements: Node.js 22.13 or newer and a Supabase project.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Set these values in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Apply [`supabase/migrations/20260714000000_classmate_beta.sql`](supabase/migrations/20260714000000_classmate_beta.sql) in the Supabase SQL editor. Add both `http://localhost:3000/auth/callback` and the production callback URL to the Supabase authentication redirect allow list.

## Temporary tester access

Tester Access is an optional preview/development-only sign-in path for controlled testing while email delivery is unavailable. It does not replace or weaken the normal email flow. Apply [`supabase/migrations/20260715000000_tester_access.sql`](supabase/migrations/20260715000000_tester_access.sql), then set these values only in `.env.local` or the Vercel **Preview** environment:

```dotenv
ENABLE_TESTER_ACCESS=true
TESTER_ACCESS_CODE=use-a-long-random-shared-code
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

Never prefix the service-role key or tester code with `NEXT_PUBLIC_`, commit either value, expose them in client-side code, or add them to the Vercel Production environment. The server refuses Tester Access when `VERCEL_ENV=production`, even if the feature flag is accidentally enabled. Incorrect attempts return a generic message and are limited to eight attempts per IP-derived fingerprint every 15 minutes. Rotate the shared code regularly and remove all three values when testing ends.

## Vercel deployment

1. Import this GitHub repository into Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL` to the Vercel project.
3. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS production origin without a trailing slash.
4. Deploy, then add `https://your-domain/auth/callback` to the Supabase redirect allow list.

Normal application traffic never uses a service-role key. The optional Tester Access endpoint uses one only when explicitly enabled outside production, to create a confirmed temporary identity and update its private rate-limit record. Every student record is owned by the authenticated user and protected by Row Level Security. New accounts always receive the `student` role; the database trigger prevents clients from promoting their own role.

## Validation

```bash
npm run typecheck
npm run lint
npm test
```

`npm test` includes a production Next.js build and source-level product contracts.

## Project structure

- `app/` — routes, UI, metadata, authentication endpoints, and beta-state API
- `features/` — challenge data and practice workspace
- `lib/` — curriculum, pipeline engine, persistence contract, and Supabase helpers
- `supabase/migrations/` — production Postgres schema, policies, and role protection
- `tests/` — product and deployment contracts

Secrets belong in local or Vercel environment variables and must never be committed.
