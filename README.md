# Pipeline Academy

Pipeline Academy is an interactive CI/CD learning platform for new developers. It combines a guided course, progress dashboard, quizzes, a realistic pipeline simulator, glossary, and demo instructor/admin workspaces.

## What works

- Responsive public site, curriculum, pricing, support, and policy pages
- Student dashboard with course progress, recommendations, streaks, and achievements
- Structured lesson with an ordering exercise, notes, bookmarks, and completion feedback
- Five-question quiz with scoring, pass/fail results, retries, and explanations
- Pipeline Lab with 14 stages, five failures, logs, hints, fixes, reruns, approval, deployment, and run history
- Compact practice dashboard with a daily challenge, ratings, submissions, pipeline runs, topic mastery, and activity calendar
- Searchable challenge library with status, difficulty, topic, acceptance, attempts, and score filters
- Resizable-style three-panel challenge workspace with Monaco YAML editing, visible checks, hidden submission validation, scoring, drafts, and restorable submission history
- Community discussions with voting, bookmarking, reporting, and a validated post composer
- Professional challenge and Pipeline Lab leaderboards plus read/unread notifications
- Searchable glossary and global search
- ChatGPT sign-in with server-created beta student accounts
- Instructor lesson editor and publishing flow
- Admin analytics, user management, and report-review surfaces
- Dark/light themes, keyboard focus, reduced motion, loading-safe layout, and mobile navigation
- Normalized D1/Drizzle data model and generated migration

## Local development

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The public catalog works anonymously. Hosted student workspaces use ChatGPT sign-in; only theme preference remains device-local.

On Windows, if the environment-variable syntax in the package script is not supported by your shell, run:

```powershell
$env:WRANGLER_LOG_PATH='.wrangler/wrangler.log'
npx vinext dev
```

## Beta workspaces

Open `/signin` and select **Sign in with ChatGPT**. New identities receive student access by default. Instructor and administrator routes are checked on the server against the role stored in D1.

Lesson completion, notes, challenge drafts, and submission history are saved to D1 through authenticated endpoints and follow the student between devices.

## Database

The logical D1 binding is `DB` in `.openai/hosting.json`. The normalized schema is in `db/schema.ts` and covers users, profiles, courses, lessons, progress, quizzes, projects, achievements, notes, notifications, certificates, pipeline runs, reports, and settings.

Generate migrations after schema changes:

```bash
npm run db:generate
```

The generated migration is committed under `drizzle/`. Seed examples are in `db/seed.sql`. Hosted Sites owns physical D1 provisioning and injects the binding at runtime.

## Supabase integration

The beta uses dispatch-owned ChatGPT sign-in and does not require Supabase. If a future public identity system is needed:

1. Copy `.env.example` to `.env.local`.
2. Add the public project URL and anon key; keep the service-role key server-only.
3. Replace the ChatGPT identity adapter with reviewed Supabase server utilities.
4. Mirror the models in `db/schema.ts` in PostgreSQL.
5. Add Row Level Security policies based on authenticated user ownership and server-verified roles.
6. Configure email verification, password reset redirects, avatar storage limits, and provider callbacks.

Never expose a service-role key to client components.

## Validation

```bash
npm run build
npm run lint
npm test
npx tsc --noEmit
```

Tests verify production metadata, the course and simulator content, public routes, authentication redirects, API rejection for anonymous requests, and deterministic challenge validation.

## Architecture

- `app/` — routes, application shell, responsive UI, metadata, sitemap, robots
- `lib/course-data.ts` — 14-module curriculum, glossary, quizzes, achievements
- `lib/pipeline.ts` — pipeline stages, statuses, and failure scenarios
- `db/` — Drizzle schema, database adapter, and seed data
- `drizzle/` — generated D1 migration
- `tests/` — rendered-route and content-contract tests
- `worker/` — Cloudflare Worker entry point used by vinext

The authenticated beta persists its core student journey in D1. `lib/demo-providers.ts` keeps the replaceable challenge-persistence contract but now uses the authenticated beta API. `.env.example` lists provider selectors for authentication, database, email, GitHub, pipeline execution, deployment, storage, payments, and analytics. All state updates use Zod validation and server-derived ownership.

## Deployment

Run a clean build, package the generated `dist/` output with the Sites packaging helper, save a version, and deploy it through Sites. Runtime secrets belong in the hosting environment, not in source control.

## Troubleshooting

- Blank or stale preview: restart the dev server and reload `http://localhost:3000`.
- D1 unavailable locally: confirm the `DB` binding and local database path in `vite.config.ts`.
- Migration changed: rerun `npm run db:generate` and inspect the SQL before deployment.
- Production auth redirects fail: verify the deployed URL and the dispatch-owned ChatGPT sign-in paths.
