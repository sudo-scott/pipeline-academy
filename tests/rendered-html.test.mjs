import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
      DB: {},
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders Pipeline Academy with production metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Pipeline Academy/);
  assert.match(html, /Learn how code/);
  assert.match(html, /Pipeline Lab/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("core curriculum and simulation data are complete", async () => {
  const [course, pipeline] = await Promise.all([
    readFile(new URL("../lib/course-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/pipeline.ts", import.meta.url), "utf8"),
  ]);
  for (let i = 1; i <= 14; i++) assert.match(course, new RegExp(`id: ${i},`));
  for (const stage of [
    "Code pushed",
    "Unit tests",
    "Approval gate",
    "Production deployment",
    "Monitoring",
  ])
    assert.match(pipeline, new RegExp(stage));
  for (const scenario of [
    "Linting error",
    "Failed unit test",
    "Exposed secret",
    "Missing environment variable",
    "Failed health check",
  ])
    assert.match(pipeline, new RegExp(scenario));
});

test("major routes render successfully", async () => {
  for (const path of [
    "/curriculum",
    "/dashboard",
    "/learn/software-delivery",
    "/quiz/ci-basics",
    "/challenges",
    "/challenge/fix-node-pipeline",
    "/lab",
    "/discuss",
    "/leaderboard",
    "/instructor",
    "/admin",
  ]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
  }
});

test("challenge vertical slice contains deterministic visible and hidden validation", async () => {
  const { starterWorkflow, passingWorkflow, validateWorkflow } = await import(
    "../features/challenges/challenge-data.ts"
  );
  const starter = validateWorkflow(starterWorkflow, true);
  const passing = validateWorkflow(passingWorkflow, true);
  assert.equal(starter.filter((check) => check.passed).length, 3);
  assert.equal(
    starter.some((check) => check.hidden),
    true,
  );
  assert.equal(
    passing.every((check) => check.passed),
    true,
  );
  assert.equal(passing.length, 7);
});
