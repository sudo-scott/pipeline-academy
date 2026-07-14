# Pipeline Academy

Pipeline Academy is an interactive CI/CD learning platform for new developers. It combines a guided course, progress dashboard, quizzes, a realistic pipeline simulator, glossary, and demo instructor/admin workspaces.

## What works

- Responsive public site, curriculum, pricing, support, and policy pages
- Student dashboard with course progress, recommendations, streaks, and achievements
- Structured lesson with an ordering exercise, notes, bookmarks, and completion feedback
- Five-question quiz with scoring, pass/fail results, retries, and explanations
- Pipeline Lab with 14 stages, five failures, logs, hints, fixes, reruns, approval, deployment, and run history
- Searchable glossary and global search
- Local demo sign-in for Student, Instructor, and Administrator roles
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

Open `http://localhost:3000`. No credentials are required. The demo stores role, theme, and lightweight interaction state in the browser only.

On Windows, if the environment-variable syntax in the package script is not supported by your shell, run:

```powershell
$env:WRANGLER_LOG_PATH='.wrangler/wrangler.log'
npx vinext dev
```

## Demo workspaces

Open `/signin`, choose Student, Instructor, or Administrator, then select **Enter demo workspace**. The displayed email and password are illustrative local values and are never sent anywhere. Do not ship demo passwords as production credentials.

## Database

The logical D1 binding is `DB` in `.openai/hosting.json`. The normalized schema is in `db/schema.ts` and covers users, profiles, courses, lessons, progress, quizzes, projects, achievements, notes, notifications, certificates, pipeline runs, reports, and settings.

Generate migrations after schema changes:

```bash
npm run db:generate
```

The generated migration is committed under `drizzle/`. Seed examples are in `db/seed.sql`. Hosted Sites owns physical D1 provisioning and injects the binding at runtime.

## Supabase integration

The current review build intentionally uses safe mock authentication because no Supabase project credentials were supplied. To connect Supabase:

1. Copy `.env.example` to `.env.local`.
2. Add the public project URL and anon key; keep the service-role key server-only.
3. Replace the demo sign-in adapter with Supabase Auth server utilities.
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

Tests verify the production metadata, core course/simulator content, and major server-rendered routes. The business logic is kept in `lib/` so it can be extended with Vitest unit suites and Playwright end-to-end coverage as the real auth adapter is connected.

## Architecture

- `app/` — routes, application shell, responsive UI, metadata, sitemap, robots
- `lib/course-data.ts` — 14-module curriculum, glossary, quizzes, achievements
- `lib/pipeline.ts` — pipeline stages, statuses, and failure scenarios
- `db/` — Drizzle schema, database adapter, and seed data
- `drizzle/` — generated D1 migration
- `tests/` — rendered-route and content-contract tests
- `worker/` — Cloudflare Worker entry point used by vinext

The local experience is intentionally client-interactive while durable production entities are designed for D1/PostgreSQL. Server actions or API routes should be introduced with Zod validation and server-side ownership/role checks when the production identity provider is connected.

## Deployment

Run a clean build, package the generated `dist/` output with the Sites packaging helper, save a version, and deploy it through Sites. Runtime secrets belong in the hosting environment, not in source control.

## Troubleshooting

- Blank or stale preview: restart the dev server and reload `http://localhost:3000`.
- D1 unavailable locally: keep using demo mode, or confirm the `DB` binding and local database path in `vite.config.ts`.
- Migration changed: rerun `npm run db:generate` and inspect the SQL before deployment.
- Production auth redirects fail: verify the deployed URL and Supabase callback allowlist.
