import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("production metadata and product copy are present", async () => {
  const [layout, app] = await Promise.all([
    read("../app/layout.tsx"),
    read("../app/academy-app.tsx"),
  ]);
  assert.match(layout, /Pipeline Academy/);
  assert.match(layout, /Learn How Code Reaches Production/);
  assert.match(app, /Pipeline Lab/);
  assert.doesNotMatch(app, /Sign in with ChatGPT|floating neon mouse/i);
});

test("core curriculum and simulation data are complete", async () => {
  const [course, lessons, pipeline] = await Promise.all([
    read("../lib/course-data.ts"),
    read("../lib/lesson-content.ts"),
    read("../lib/pipeline.ts"),
  ]);
  for (let i = 1; i <= 14; i++) assert.match(lessons, new RegExp(`id: ${i},`));
  assert.match(course, /courseModules\.map/);
  assert.equal((lessons.match(/lesson\(\{/g) ?? []).length, 28);
  assert.equal((lessons.match(/objectives: \[/g) ?? []).length, 28);
  assert.equal((lessons.match(/practice: \{ prompt:/g) ?? []).length - 1, 28);
  for (const stage of [
    "Code pushed",
    "Unit tests",
    "Approval gate",
    "Production deployment",
    "Monitoring",
  ]) assert.match(pipeline, new RegExp(stage));
  for (const scenario of [
    "Linting error",
    "Failed unit test",
    "Exposed secret",
    "Missing environment variable",
    "Failed health check",
  ]) assert.match(pipeline, new RegExp(scenario));
});

test("Vercel runtime and Supabase authentication contracts are configured", async () => {
  const [packageJson, auth, migration, proxy] = await Promise.all([
    read("../package.json"),
    read("../lib/beta-server.ts"),
    read("../supabase/migrations/20260714000000_classmate_beta.sql"),
    read("../proxy.ts"),
  ]);
  const pkg = JSON.parse(packageJson);
  assert.equal(pkg.scripts.build, "next build");
  assert.equal(pkg.dependencies["@supabase/ssr"].length > 0, true);
  assert.match(auth, /supabase\.auth\.getUser\(\)/);
  assert.match(proxy, /supabase\.auth\.getUser\(\)/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /protect_beta_member_role/);
  assert.doesNotMatch(packageJson, /vinext|wrangler|cloudflare/i);
});

test("challenge vertical slice contains visible and hidden validation", async () => {
  const { starterWorkflow, passingWorkflow, validateWorkflow } = await import(
    "../features/challenges/challenge-data.ts"
  );
  const starter = validateWorkflow(starterWorkflow, true);
  const passing = validateWorkflow(passingWorkflow, true);
  assert.equal(starter.filter((check) => check.passed).length, 3);
  assert.equal(starter.some((check) => check.hidden), true);
  assert.equal(passing.every((check) => check.passed), true);
  assert.equal(passing.length, 7);
});

test("tester access is gated, constant-time, and production-disabled", async () => {
  const {
    evaluateTesterAttempt,
    isTesterAccessEnabled,
    testerAccountEmail,
    testerCodeMatches,
  } = await import("../lib/tester-access.ts");

  assert.equal(
    isTesterAccessEnabled({
      ENABLE_TESTER_ACCESS: "true",
      VERCEL_ENV: "preview",
      NODE_ENV: "production",
    }),
    true,
  );
  assert.equal(
    isTesterAccessEnabled({
      ENABLE_TESTER_ACCESS: "true",
      VERCEL_ENV: "production",
      NODE_ENV: "production",
    }),
    false,
  );
  assert.equal(
    isTesterAccessEnabled({
      ENABLE_TESTER_ACCESS: "true",
      NODE_ENV: "production",
    }),
    false,
  );
  assert.equal(testerCodeMatches("correct-code", "correct-code"), true);
  assert.equal(testerCodeMatches("wrong-code", "correct-code"), false);
  assert.equal(
    testerAccountEmail(
      "66A673C0-6A7B-4B56-889B-80A43A879E3D",
      "Preview.Example.com",
    ),
    "tester-66a673c06a7b4b56889b80a43a879e3d@preview.example.com",
  );

  let sessionCreated = false;
  const success = await evaluateTesterAttempt(
    {
      submittedCode: "correct-code",
      configuredCode: "correct-code",
      fingerprint: "fingerprint",
    },
    {
      consumeAttempt: async () => true,
      establishSession: async () => {
        sessionCreated = true;
      },
    },
  );
  assert.equal(success, "success");
  assert.equal(sessionCreated, true);

  sessionCreated = false;
  const incorrect = await evaluateTesterAttempt(
    {
      submittedCode: "wrong-code",
      configuredCode: "correct-code",
      fingerprint: "fingerprint",
    },
    {
      consumeAttempt: async () => true,
      establishSession: async () => {
        sessionCreated = true;
      },
    },
  );
  assert.equal(incorrect, "invalid");
  assert.equal(sessionCreated, false);

  const missingConfiguration = await evaluateTesterAttempt(
    {
      submittedCode: "anything",
      configuredCode: undefined,
      fingerprint: "fingerprint",
    },
    {
      consumeAttempt: async () => {
        throw new Error("Rate limiter should not be called");
      },
      establishSession: async () => {
        throw new Error("Session should not be created");
      },
    },
  );
  assert.equal(missingConfiguration, "unavailable");

  const rateLimited = await evaluateTesterAttempt(
    {
      submittedCode: "correct-code",
      configuredCode: "correct-code",
      fingerprint: "fingerprint",
    },
    {
      consumeAttempt: async () => false,
      establishSession: async () => {
        throw new Error("Session should not be created");
      },
    },
  );
  assert.equal(rateLimited, "rate_limited");
});

test("tester access secrets remain server-only and rate limiting is service-role-only", async () => {
  const [route, app, exampleEnv, migration] = await Promise.all([
    read("../app/api/auth/tester-access/route.ts"),
    read("../app/academy-app.tsx"),
    read("../.env.example"),
    read("../supabase/migrations/20260715000000_tester_access.sql"),
  ]);
  assert.match(route, /process\.env\.TESTER_ACCESS_CODE/);
  assert.doesNotMatch(app, /process\.env\.TESTER_ACCESS_CODE/);
  assert.match(app, /TESTER ACCESS/);
  assert.match(exampleEnv, /ENABLE_TESTER_ACCESS=false/);
  assert.match(migration, /security definer/);
  assert.match(migration, /revoke all.*authenticated/s);
  assert.match(migration, /grant execute.*service_role/s);
});
