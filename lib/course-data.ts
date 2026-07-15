import { courseModules } from "./lesson-content";

export type Module = {
  id: number;
  title: string;
  summary: string;
  minutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lessons: string[];
  topics: string[];
};

export const modules: Module[] = courseModules.map((module) => ({
  id: module.id,
  title: module.title,
  summary: module.summary,
  minutes: module.minutes,
  difficulty: module.difficulty,
  lessons: module.lessons.map((item) => item.title),
  topics: module.topics,
}));

export const glossary = [
  ["Artifact", "A versioned build output promoted through later stages."],
  ["Baseline", "An identified set of versions that defines a reproducible state."],
  ["Build", "The process that turns source and dependencies into runnable software."],
  ["Continuous Delivery", "Keeping every successful candidate ready for release on demand."],
  ["Continuous Integration", "Integrating small changes frequently and verifying each one automatically."],
  ["Cycle time", "Time from deciding on a change until users can use it."],
  ["Deployment pipeline", "The automated build, deploy, test, and release process for a change."],
  ["Idempotent", "Able to be repeated safely while converging on the same intended state."],
  ["Release candidate", "An identified version being evaluated for release."],
  ["Rollback", "Restoring a previously known-good application version."],
  ["Smoke test", "A short post-deployment check of essential operation."],
  ["Traceability", "The ability to connect a deployed result to its exact inputs and evidence."],
] as const;

export const quizQuestions = [
  {
    question: "What is cycle time in software delivery?",
    answers: [
      "Only the time spent writing code",
      "The time from deciding on a change until users can use it",
      "The duration of the longest automated test",
      "The period between two team meetings",
    ],
    correct: 1,
    explanation:
      "Cycle time covers the whole value stream from the decision to change through usable software, including queues and handoffs.",
  },
  {
    question: "Which practice turns release into a repeatable routine?",
    answers: [
      "Release large batches rarely",
      "Keep production changes in an administrator's memory",
      "Automate and rehearse the same process frequently",
      "Test only after development is complete",
    ],
    correct: 2,
    explanation:
      "Frequent execution exposes weaknesses early, while automation removes variation from repeated steps.",
  },
  {
    question: "What should happen when a required pipeline gate fails?",
    answers: [
      "Promote the candidate anyway",
      "Stop promotion and restore a trusted state",
      "Hide the result",
      "Rebuild a different binary for production",
    ],
    correct: 1,
    explanation:
      "A failing gate removes the evidence needed for promotion. The team fixes or reverts before a new candidate advances.",
  },
  {
    question: "Why should the fastest useful checks run first?",
    answers: [
      "They reject bad candidates cheaply and shorten feedback",
      "Later tests do not matter",
      "They guarantee no defect exists",
      "They avoid version control",
    ],
    correct: 0,
    explanation:
      "Early inexpensive gates keep feedback fast and prevent unsuitable candidates from consuming scarce test environments.",
  },
  {
    question: "What is a release candidate?",
    answers: [
      "Any unfinished local file",
      "A person authorized to deploy",
      "An identified version being evaluated for release",
      "A production-only configuration value",
    ],
    correct: 2,
    explanation:
      "A candidate is uniquely identified so its artifact, inputs, and accumulated evidence can be traced.",
  },
];

export const achievements = [
  ["First feedback", "Completed the release foundations lesson"],
  ["Green build", "Completed a pipeline without failures"],
  ["Pipeline debugger", "Diagnosed and fixed a failed stage"],
  ["Approval granted", "Reviewed an identified release candidate"],
  ["Safe rollback", "Recovered from an unhealthy deployment"],
  ["Quiz mastery", "Scored at least 80% on a module quiz"],
  ["Seven-day streak", "Learned consistently for one week"],
  ["Production ready", "Completed the delivery-governance module"],
] as const;

export const workflowExample = `commit stage
  checkout identified revision
  compile
  run unit tests and analysis
  package once
  publish identified artifact

acceptance stage
  deploy the same artifact
  run smoke tests
  run acceptance tests

release stage
  authorize promotion
  deploy with the rehearsed script
  verify and monitor`;
