"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  Code2,
  Filter,
  History,
  Lightbulb,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  TerminalSquare,
  XCircle,
} from "lucide-react";
import {
  challenges,
  starterWorkflow,
  validateWorkflow,
  type Challenge,
  type CheckResult,
} from "./challenge-data";
import { challengePersistence } from "../../lib/demo-providers";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

function Difficulty({ value }: { value: Challenge["difficulty"] }) {
  return <span className={`difficulty ${value.toLowerCase()}`}>{value}</span>;
}

export function ChallengeLibrary({
  openChallenge,
}: {
  openChallenge: () => void;
}) {
  const [query, setQuery] = useState(""),
    [difficulty, setDifficulty] = useState("All"),
    [status, setStatus] = useState("All"),
    [topic, setTopic] = useState("All");
  const rows = useMemo(
    () =>
      challenges.filter(
        (c) =>
          (c.title + c.topics.join(" "))
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (difficulty === "All" || c.difficulty === difficulty) &&
          (status === "All" || c.status === status) &&
          (topic === "All" || c.topics.includes(topic)),
      ),
    [query, difficulty, status, topic],
  );
  return (
    <div className="practice-page">
      <header className="practice-heading">
        <div>
          <span className="eyebrow">PRACTICE</span>
          <h1>CI/CD Challenges</h1>
          <p>
            Solve realistic delivery problems and build a submission history you
            can explain.
          </p>
        </div>
        <div className="practice-summary">
          <div>
            <b>3</b>
            <small>Solved</small>
          </div>
          <div>
            <b>1,248</b>
            <small>Rating</small>
          </div>
          <div>
            <b>67%</b>
            <small>Acceptance</small>
          </div>
        </div>
      </header>
      <section className="daily-strip">
        <span>
          <span className="daily-icon">
            <Lightbulb />
          </span>
          <span>
            <small>DAILY CHALLENGE · +40 XP</small>
            <b>Repair a Node.js CI Pipeline</b>
          </span>
        </span>
        <span>
          <span>Easy</span>
          <b>12:18:42</b>
          <button onClick={openChallenge}>
            Solve now <ChevronRight />
          </button>
        </span>
      </section>
      <div className="challenge-filters">
        <label>
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search challenges"
          />
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option>All</option>
          <option>Solved</option>
          <option>Attempted</option>
          <option>Todo</option>
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          aria-label="Filter by difficulty"
        >
          <option>All</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          aria-label="Filter by topic"
        >
          <option>All</option>
          <option>YAML</option>
          <option>Testing</option>
          <option>Docker</option>
          <option>Security</option>
          <option>Rollbacks</option>
        </select>
        <button
          onClick={() => {
            setQuery("");
            setStatus("All");
            setDifficulty("All");
            setTopic("All");
          }}
        >
          <Filter /> Reset
        </button>
      </div>
      <div className="challenge-table" role="table">
        <header role="row">
          <span>Status</span>
          <span>Challenge</span>
          <span>Difficulty</span>
          <span>Acceptance</span>
          <span>Attempts</span>
          <span>Best</span>
          <span />
        </header>
        {rows.map((c) => (
          <button
            role="row"
            key={c.id}
            onClick={openChallenge}
            aria-label={`${c.title}, ${c.difficulty}`}
          >
            <span>
              {c.status === "Solved" ? (
                <CheckCircle2 />
              ) : c.status === "Attempted" ? (
                <AlertTriangle />
              ) : (
                <Circle />
              )}
            </span>
            <span>
              <b>{c.title}</b>
              <small>
                {c.topics.map((t) => (
                  <em key={t}>{t}</em>
                ))}
              </small>
            </span>
            <Difficulty value={c.difficulty} />
            <span>{c.acceptance}%</span>
            <span>{c.attempts.toLocaleString()}</span>
            <span>{c.bestScore ? `${c.bestScore}%` : "—"}</span>
            <Bookmark />
          </button>
        ))}
        {!rows.length && (
          <div className="challenge-empty">
            <Search />
            <b>No matching challenges</b>
            <span>Clear a filter or try another topic.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChallengeWorkspace({
  exit,
  notify,
}: {
  exit: () => void;
  notify: (message: string) => void;
}) {
  const [source, setSource] = useState(starterWorkflow),
    [checks, setChecks] = useState<CheckResult[]>([]),
    [submitted, setSubmitted] = useState(false),
    [running, setRunning] = useState(false),
    [activeTab, setActiveTab] = useState<"description" | "editor" | "results">(
      "description",
    ),
    [history, setHistory] = useState<
      { score: number; status: string; source: string; time: string }[]
    >([]);
  useEffect(() => {
    void Promise.all([
      challengePersistence.loadDraft("fix-node-pipeline"),
      challengePersistence.listSubmissions("fix-node-pipeline"),
    ]).then(([draft, items]) => {
      if (draft) setSource(draft);
      setHistory(items);
    });
  }, []);
  const run = () => {
    setRunning(true);
    setSubmitted(false);
    setActiveTab("results");
    setTimeout(() => {
      setChecks(validateWorkflow(source));
      setRunning(false);
    }, 650);
  };
  const submit = () => {
    setRunning(true);
    setActiveTab("results");
    setTimeout(() => {
      const next = validateWorkflow(source, true);
      const score = Math.round(
        (next.filter((c) => c.passed).length / next.length) * 100,
      );
      const entry = {
        score,
        status:
          score === 100
            ? "Accepted"
            : score >= 60
              ? "Partially Correct"
              : "Wrong Answer",
        source,
        time: "Just now",
      };
      setChecks(next);
      setSubmitted(true);
      setRunning(false);
      void challengePersistence
        .saveSubmission("fix-node-pipeline", entry)
        .then(setHistory);
      notify(`${entry.status} · ${score}%`);
    }, 850);
  };
  const save = () => {
    void challengePersistence.saveDraft("fix-node-pipeline", source);
    notify("Draft saved on this device");
  };
  const score = checks.length
    ? Math.round((checks.filter((c) => c.passed).length / checks.length) * 100)
    : 0;
  return (
    <div className="challenge-workspace">
      <header className="challenge-bar">
        <button onClick={exit}>Challenges</button>
        <ChevronRight />
        <b>Repair a Node.js CI Pipeline</b>
        <span className="workspace-spacer" />
        <button
          className="tool-action"
          onClick={() => {
            setSource(starterWorkflow);
            setChecks([]);
            setSubmitted(false);
          }}
        >
          <RotateCcw /> Reset
        </button>
        <button className="tool-action" onClick={save}>
          <Bookmark /> Save Draft
        </button>
        <button className="tool-action run" onClick={run} disabled={running}>
          <Play /> Run
        </button>
        <button
          className="tool-action submit"
          onClick={submit}
          disabled={running}
        >
          <Send /> Submit
        </button>
      </header>
      <nav
        className="mobile-workspace-tabs"
        aria-label="Challenge workspace sections"
      >
        {(["description", "editor", "results"] as const).map((tab) => (
          <button
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
            key={tab}
          >
            {tab}
          </button>
        ))}
      </nav>
      <div className="challenge-split">
        <section
          className={`challenge-description ${activeTab !== "description" ? "mobile-hidden" : ""}`}
        >
          <div className="workspace-tabs">
            <button className="active">Description</button>
            <button
              onClick={() =>
                notify("Make one legitimate attempt to unlock solutions")
              }
            >
              Solutions
            </button>
            <button>Submissions</button>
            <button>Discuss</button>
          </div>
          <article>
            <div className="challenge-title">
              <span>1.</span>
              <h1>Repair a Node.js CI Pipeline</h1>
            </div>
            <div className="challenge-badges">
              <Difficulty value="Easy" />
              <span>Acceptance 72.4%</span>
              <span>18.4K attempts</span>
            </div>
            <p>
              A team’s pull-request workflow installs dependencies and runs
              tests, but it is slow and cannot provide a deployable artifact.
              Repair the workflow so every successful run produces the same
              verified build.
            </p>
            <h2>Objective</h2>
            <p>
              Update the GitHub Actions workflow to use a reproducible install,
              fail fast on lint errors, run the test suite, build the app, and
              upload <code>dist/</code> as an artifact.
            </p>
            <h2>Requirements</h2>
            <ul>
              <li>
                Use <code>npm ci</code>, not <code>npm install</code>.
              </li>
              <li>Run linting before the test suite.</li>
              <li>Build only after verification passes.</li>
              <li>
                Upload <code>dist/</code> with{" "}
                <code>actions/upload-artifact@v4</code>.
              </li>
              <li>Apply least-privilege workflow permissions.</li>
            </ul>
            <aside className="concept-note">
              <Lightbulb />
              <span>
                <b>Why this matters</b>
                <p>
                  Deploying the exact artifact created by CI prevents staging
                  and production from running different builds.
                </p>
              </span>
            </aside>
            <details>
              <summary>Hint 1: installation command</summary>
              <p>
                <code>npm ci</code> rejects lockfile drift and creates
                repeatable installations.
              </p>
            </details>
            <details>
              <summary>Hint 2: artifact action</summary>
              <p>
                Use the official upload action and point its <code>path</code>{" "}
                at <code>dist/</code>.
              </p>
            </details>
          </article>
        </section>
        <section
          className={`challenge-editor ${activeTab !== "editor" ? "mobile-hidden" : ""}`}
        >
          <header>
            <span>
              <Code2 /> .github/workflows/ci.yml
            </span>
            <span>YAML · GitHub Actions</span>
          </header>
          <Editor
            height="100%"
            language="yaml"
            theme="vs-dark"
            value={source}
            onChange={(v) => setSource(v || "")}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              ariaLabel: "CI workflow YAML editor",
            }}
          />
        </section>
        <section
          className={`challenge-results ${activeTab !== "results" ? "mobile-hidden" : ""}`}
        >
          <header>
            <span>
              <TerminalSquare /> Tests & Results
            </span>
            {checks.length > 0 && (
              <span>
                {checks.filter((c) => c.passed).length}/{checks.length} checks
              </span>
            )}
          </header>
          {running ? (
            <div className="checking-state">
              <RefreshCw />
              <b>Running pipeline checks…</b>
              <span>Parsing YAML and executing deterministic validators.</span>
            </div>
          ) : checks.length === 0 ? (
            <div className="result-placeholder">
              <Play />
              <b>Ready to run</b>
              <span>
                Run visible checks while you work. Submit when you are ready for
                hidden validation.
              </span>
            </div>
          ) : (
            <>
              <div
                className={`submission-summary ${score === 100 ? "accepted" : score >= 60 ? "partial" : "rejected"}`}
              >
                <span>
                  {score === 100 ? <CheckCircle2 /> : <AlertTriangle />}
                </span>
                <div>
                  <small>{submitted ? "SUBMISSION RESULT" : "TEST RUN"}</small>
                  <b>
                    {submitted
                      ? score === 100
                        ? "Accepted"
                        : score >= 60
                          ? "Partially Correct"
                          : "Wrong Answer"
                      : `${score}% of visible checks passed`}
                  </b>
                </div>
                <strong>{score}%</strong>
              </div>
              <div className="check-list">
                {checks.map((c) => (
                  <div key={c.name} className={c.passed ? "passed" : "failed"}>
                    {c.passed ? <CheckCircle2 /> : <XCircle />}
                    <span>
                      <b>{c.hidden ? "Hidden check" : c.name}</b>
                      <small>{c.detail}</small>
                    </span>
                  </div>
                ))}
              </div>
              <div className="execution-meta">
                <span>
                  <small>Execution</small>
                  <b>0.84s</b>
                </span>
                <span>
                  <small>Pipeline</small>
                  <b>1m 42s</b>
                </span>
                <span>
                  <small>Memory</small>
                  <b>64 MB</b>
                </span>
              </div>
              {score < 100 && (
                <button
                  className="recommended"
                  onClick={() => notify("Recommended lesson bookmarked")}
                >
                  <BookOpen />
                  <span>
                    <small>RECOMMENDED LESSON</small>
                    <b>Reliable builds and artifacts</b>
                  </span>
                  <ChevronRight />
                </button>
              )}
            </>
          )}{" "}
          {history.length > 0 && (
            <div className="submission-history">
              <h3>
                <History /> Previous submissions
              </h3>
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSource(h.source);
                    setActiveTab("editor");
                    notify("Previous submission restored");
                  }}
                >
                  <span className={h.status === "Accepted" ? "ok" : "warn"}>
                    {h.status}
                  </span>
                  <b>{h.score}%</b>
                  <span>{h.time}</span>
                  <RotateCcw />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
