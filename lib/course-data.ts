export type Module = {
  id: number;
  title: string;
  summary: string;
  minutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lessons: string[];
  topics: string[];
};

export const modules: Module[] = [
  {
    id: 1,
    title: "Software Delivery Basics",
    summary:
      "Follow code from a developer's laptop to a real production environment.",
    minutes: 42,
    difficulty: "Beginner",
    lessons: ["From idea to production", "Branches, reviews, and environments"],
    topics: ["Git", "branches", "pull requests"],
  },
  {
    id: 2,
    title: "Introduction to CI/CD",
    summary: "Understand CI, delivery, and deployment without the jargon.",
    minutes: 48,
    difficulty: "Beginner",
    lessons: ["Why pipelines exist", "Delivery vs. deployment"],
    topics: ["CI", "CD", "automation"],
  },
  {
    id: 3,
    title: "Continuous Integration",
    summary:
      "Merge frequently and let automated checks protect the main branch.",
    minutes: 55,
    difficulty: "Beginner",
    lessons: ["The integration loop", "Pull request checks"],
    topics: ["builds", "linters", "artifacts"],
  },
  {
    id: 4,
    title: "Automated Testing",
    summary: "Choose the right test and understand failures before they ship.",
    minutes: 64,
    difficulty: "Beginner",
    lessons: ["The testing pyramid", "Diagnosing a failing test"],
    topics: ["unit", "integration", "end-to-end"],
  },
  {
    id: 5,
    title: "Build Processes",
    summary: "Turn source code and dependencies into a reproducible artifact.",
    minutes: 51,
    difficulty: "Beginner",
    lessons: ["Inside a build", "Caching and reproducibility"],
    topics: ["npm", "bundling", "caching"],
  },
  {
    id: 6,
    title: "CI/CD Configuration Files",
    summary: "Read and write GitHub Actions workflows with confidence.",
    minutes: 78,
    difficulty: "Intermediate",
    lessons: ["YAML without fear", "Jobs, steps, and runners"],
    topics: ["YAML", "GitHub Actions", "secrets"],
  },
  {
    id: 7,
    title: "Continuous Delivery",
    summary:
      "Keep every approved change release-ready with safe approval gates.",
    minutes: 58,
    difficulty: "Intermediate",
    lessons: ["Release-ready software", "Staging approvals"],
    topics: ["staging", "approvals", "feature flags"],
  },
  {
    id: 8,
    title: "Continuous Deployment",
    summary: "Release successful changes automatically—with guardrails.",
    minutes: 62,
    difficulty: "Intermediate",
    lessons: ["Automatic production releases", "Progressive delivery"],
    topics: ["canary", "blue-green", "rollouts"],
  },
  {
    id: 9,
    title: "Containers and Docker",
    summary: "Package an application so it runs the same everywhere.",
    minutes: 66,
    difficulty: "Intermediate",
    lessons: ["Containers explained", "Build your first image"],
    topics: ["Dockerfile", "images", "registries"],
  },
  {
    id: 10,
    title: "Cloud Deployments",
    summary: "Connect pipelines to modern hosting and cloud environments.",
    minutes: 57,
    difficulty: "Intermediate",
    lessons: ["Where software runs", "Preview to production"],
    topics: ["serverless", "HTTPS", "logs"],
  },
  {
    id: 11,
    title: "Security in CI/CD",
    summary:
      "Protect credentials, dependencies, and the software supply chain.",
    minutes: 72,
    difficulty: "Intermediate",
    lessons: ["Secrets stay secret", "Secure the pipeline"],
    topics: ["least privilege", "scanning", "supply chain"],
  },
  {
    id: 12,
    title: "Monitoring and Rollbacks",
    summary:
      "Spot unhealthy releases and recover quickly when things go wrong.",
    minutes: 69,
    difficulty: "Intermediate",
    lessons: ["Signals after deploy", "Incidents and rollbacks"],
    topics: ["metrics", "alerts", "MTTR"],
  },
  {
    id: 13,
    title: "Advanced Pipeline Strategies",
    summary: "Make larger pipelines faster, reusable, and easier to operate.",
    minutes: 84,
    difficulty: "Advanced",
    lessons: ["Parallel and matrix jobs", "GitOps and infrastructure"],
    topics: ["monorepos", "IaC", "runners"],
  },
  {
    id: 14,
    title: "Final Pipeline Project",
    summary:
      "Design, run, debug, approve, deploy, and monitor a complete workflow.",
    minutes: 120,
    difficulty: "Advanced",
    lessons: ["Architecture challenge", "Production release simulation"],
    topics: ["capstone", "grading", "certification"],
  },
];

export const glossary = [
  [
    "Artifact",
    "A versioned file produced by a build and passed to later stages.",
  ],
  ["Branch", "An independent line of development inside a repository."],
  ["Build", "The process that turns source code into runnable software."],
  [
    "Canary deployment",
    "A release sent to a small group before wider rollout.",
  ],
  [
    "Continuous Delivery",
    "Keeping successful changes ready for a human-approved release.",
  ],
  [
    "Continuous Deployment",
    "Automatically releasing every successful change to production.",
  ],
  [
    "Continuous Integration",
    "Frequently merging changes and verifying each merge automatically.",
  ],
  ["Pipeline", "An automated sequence of checks and delivery steps."],
  ["Rollback", "Restoring a previously known-good version after a problem."],
  ["Runner", "A machine or container that executes a pipeline job."],
  [
    "Secret",
    "A sensitive value, such as an API key, stored outside source code.",
  ],
  ["Staging", "A production-like environment used for final validation."],
  ["Trigger", "An event—such as a push—that starts a workflow."],
  ["YAML", "A human-readable format commonly used for pipeline configuration."],
] as const;

export const quizQuestions = [
  {
    question: "What is the main purpose of Continuous Integration?",
    answers: [
      "Merge changes often and verify them automatically",
      "Deploy every change without tests",
      "Replace source control",
      "Write production code automatically",
    ],
    correct: 0,
    explanation:
      "CI creates a fast feedback loop: integrate small changes frequently, then build and test them automatically.",
  },
  {
    question: "Which statement best describes Continuous Delivery?",
    answers: [
      "Every passing change is automatically public",
      "Changes stay release-ready, with a human approval possible",
      "Code is delivered by email",
      "Testing happens only in production",
    ],
    correct: 1,
    explanation:
      "Delivery prepares and validates a release; deployment goes one step further and releases automatically.",
  },
  {
    question: "Why should a pipeline create an artifact once?",
    answers: [
      "To make logs longer",
      "To avoid Git branches",
      "To promote the same tested output between environments",
      "To skip security scans",
    ],
    correct: 2,
    explanation:
      "Promoting one immutable artifact prevents staging and production from running subtly different builds.",
  },
  {
    question:
      "A health check fails immediately after deployment. What is safest?",
    answers: [
      "Ignore it",
      "Delete the repository",
      "Disable all tests",
      "Pause rollout and roll back to the known-good release",
    ],
    correct: 3,
    explanation:
      "A failed health check is a strong signal to stop impact and restore the last healthy release.",
  },
  {
    question: "Where should an API key be stored?",
    answers: [
      "In a protected secret store",
      "In the README",
      "In client-side JavaScript",
      "In a public Docker image",
    ],
    correct: 0,
    explanation:
      "Secret stores keep sensitive values encrypted and inject them only where authorized.",
  },
];

export const achievements = [
  ["First push", "Started the software delivery journey"],
  ["Green build", "Completed a pipeline without failures"],
  ["Pipeline debugger", "Diagnosed and fixed a failed job"],
  ["Approval granted", "Reviewed a staging release"],
  ["Safe rollback", "Recovered from an unhealthy deployment"],
  ["Quiz mastery", "Scored at least 80% on a module quiz"],
  ["Seven-day streak", "Learned consistently for one week"],
  ["Production ready", "Completed the final pipeline project"],
] as const;

export const workflowExample = `name: CI Pipeline
on:
  push:
    branches: [main]
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build`;
