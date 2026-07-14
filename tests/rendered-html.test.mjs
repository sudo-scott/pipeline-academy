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
  const [course, pipeline] = await Promise.all([
    read("../lib/course-data.ts"),
    read("../lib/pipeline.ts"),
  ]);
  for (let i = 1; i <= 14; i++) assert.match(course, new RegExp(`id: ${i},`));
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
