export type Challenge = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptance: number;
  topics: string[];
  attempts: number;
  bestScore: number | null;
  status: "Solved" | "Attempted" | "Todo";
  lastSubmission: string;
};

export const challenges: Challenge[] = [
  {
    id: "fix-node-pipeline",
    title: "Repair a Node.js CI Pipeline",
    difficulty: "Easy",
    acceptance: 72.4,
    topics: ["YAML", "GitHub Actions", "Testing"],
    attempts: 18420,
    bestScore: 80,
    status: "Attempted",
    lastSubmission: "18 min ago",
  },
  {
    id: "cache-dependencies",
    title: "Cache npm Dependencies Safely",
    difficulty: "Easy",
    acceptance: 68.9,
    topics: ["Builds", "Caching"],
    attempts: 12308,
    bestScore: null,
    status: "Todo",
    lastSubmission: "—",
  },
  {
    id: "secure-secrets",
    title: "Remove an Exposed Deployment Secret",
    difficulty: "Medium",
    acceptance: 54.1,
    topics: ["Security", "Secrets"],
    attempts: 9622,
    bestScore: 100,
    status: "Solved",
    lastSubmission: "Yesterday",
  },
  {
    id: "matrix-tests",
    title: "Build a Node Version Matrix",
    difficulty: "Medium",
    acceptance: 49.8,
    topics: ["GitHub Actions", "Testing"],
    attempts: 7744,
    bestScore: null,
    status: "Todo",
    lastSubmission: "—",
  },
  {
    id: "docker-release",
    title: "Publish a Versioned Docker Image",
    difficulty: "Medium",
    acceptance: 46.7,
    topics: ["Docker", "Production"],
    attempts: 6310,
    bestScore: null,
    status: "Todo",
    lastSubmission: "—",
  },
  {
    id: "canary-rollback",
    title: "Recover a Failed Canary Release",
    difficulty: "Hard",
    acceptance: 31.2,
    topics: ["Monitoring", "Rollbacks"],
    attempts: 4928,
    bestScore: 60,
    status: "Attempted",
    lastSubmission: "4 days ago",
  },
  {
    id: "approval-gate",
    title: "Protect Production with an Approval Gate",
    difficulty: "Hard",
    acceptance: 37.5,
    topics: ["Staging", "Production"],
    attempts: 5121,
    bestScore: null,
    status: "Todo",
    lastSubmission: "—",
  },
];

export const starterWorkflow = `name: Node CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm test
      - run: npm run build`;

export const passingWorkflow = `name: Node CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: dist/`;

export type CheckResult = {
  name: string;
  passed: boolean;
  hidden?: boolean;
  detail: string;
};

export function validateWorkflow(
  source: string,
  includeHidden = false,
): CheckResult[] {
  const checks: CheckResult[] = [
    {
      name: "Checkout repository",
      passed: source.includes("actions/checkout@v4"),
      detail:
        "Use the official checkout action before accessing repository files.",
    },
    {
      name: "Reproducible install",
      passed: /run:\s*npm ci\b/.test(source),
      detail: "Use npm ci so the lockfile is installed exactly.",
    },
    {
      name: "Lint before tests",
      passed:
        source.indexOf("npm run lint") > -1 &&
        source.indexOf("npm run lint") < source.indexOf("npm test"),
      detail: "Run inexpensive lint checks before the test suite.",
    },
    {
      name: "Run automated tests",
      passed: source.includes("npm test"),
      detail: "The workflow must stop when the test suite fails.",
    },
    {
      name: "Build the application",
      passed: source.includes("npm run build"),
      detail: "Create the production build only after verification succeeds.",
    },
    {
      name: "Upload the artifact",
      passed:
        source.includes("actions/upload-artifact@v4") &&
        source.includes("path: dist/"),
      detail: "Upload dist/ so later deployment jobs use the tested build.",
    },
  ];
  if (includeHidden)
    checks.push({
      name: "Least-privilege permissions",
      passed: /permissions:\s*\n\s*contents:\s*read/.test(source),
      hidden: true,
      detail:
        "Set contents: read instead of relying on broader token permissions.",
    });
  return checks;
}
