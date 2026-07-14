export type StageStatus =
  | "waiting"
  | "queued"
  | "running"
  | "passed"
  | "failed"
  | "skipped"
  | "cancelled";
export type PipelineStage = {
  id: number;
  name: string;
  status: StageStatus;
  duration: string;
  log: string;
};

export const stageNames = [
  "Code pushed",
  "Repository checkout",
  "Dependencies installed",
  "Linting",
  "Unit tests",
  "Integration tests",
  "Application build",
  "Security scan",
  "Artifact creation",
  "Staging deployment",
  "Approval gate",
  "Production deployment",
  "Health check",
  "Monitoring",
];

export const scenarios = [
  {
    id: "lint",
    name: "Linting error",
    stage: 3,
    hint: "Check the latest changed file for an unused variable.",
    log: "src/cart.ts:18:7  error  'discount' is assigned a value but never used",
    fix: "Remove unused variable",
  },
  {
    id: "unit",
    name: "Failed unit test",
    stage: 4,
    hint: "The total should include quantity, not only unit price.",
    log: "FAIL cart.test.ts · expected 42, received 21\n1 failed, 27 passed",
    fix: "Correct total calculation",
  },
  {
    id: "secret",
    name: "Exposed secret",
    stage: 7,
    hint: "Credentials must not be committed to source control.",
    log: "HIGH: Possible API key detected in config/client.ts:7",
    fix: "Move key to secret store",
  },
  {
    id: "build",
    name: "Missing environment variable",
    stage: 6,
    hint: "Compare the build settings with .env.example.",
    log: "Error: NEXT_PUBLIC_API_URL is required during build",
    fix: "Add environment variable",
  },
  {
    id: "health",
    name: "Failed health check",
    stage: 12,
    hint: "The new version is returning server errors. Protect users first.",
    log: "GET /health → 503 Service Unavailable (5/5 attempts)",
    fix: "Roll back release",
  },
] as const;

export function freshStages(): PipelineStage[] {
  return stageNames.map((name, id) => ({
    id,
    name,
    status: "waiting",
    duration: "—",
    log: `$ ${name.toLowerCase()}\nWaiting for previous stage…`,
  }));
}
