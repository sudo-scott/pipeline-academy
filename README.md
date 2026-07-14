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

## Vercel deployment

1. Import this GitHub repository into Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL` to the Vercel project.
3. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS production origin without a trailing slash.
4. Deploy, then add `https://your-domain/auth/callback` to the Supabase redirect allow list.

No Supabase service-role key is used by the application. Every persisted student record is owned by the authenticated user and protected by Row Level Security. New accounts always receive the `student` role; the database trigger prevents clients from promoting their own role.

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
