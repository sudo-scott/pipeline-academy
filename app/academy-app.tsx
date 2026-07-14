"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  BookMarked,
  BookOpen,
  Bot,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Code2,
  Command,
  Container,
  Database,
  Gauge,
  GitBranch,
  HelpCircle,
  Home,
  Lightbulb,
  LockKeyhole,
  Menu,
  Moon,
  Pause,
  Play,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Square,
  Sun,
  TerminalSquare,
  Trophy,
  User,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import {
  achievements,
  glossary,
  modules,
  quizQuestions,
} from "../lib/course-data";
import { freshStages, scenarios, type PipelineStage } from "../lib/pipeline";

type Role = "student" | "instructor" | "admin";
function Github() {
  return <Code2 />;
}
type View =
  | "home"
  | "curriculum"
  | "dashboard"
  | "lesson"
  | "quiz"
  | "lab"
  | "glossary"
  | "signin"
  | "account"
  | "instructor"
  | "admin"
  | "about"
  | "pricing"
  | "contact"
  | "privacy"
  | "terms"
  | "accessibility";
const paths: Record<View, string> = {
  home: "/",
  curriculum: "/curriculum",
  dashboard: "/dashboard",
  lesson: "/learn/software-delivery",
  quiz: "/quiz/ci-basics",
  lab: "/lab",
  glossary: "/glossary",
  signin: "/signin",
  account: "/account",
  instructor: "/instructor",
  admin: "/admin",
  about: "/about",
  pricing: "/pricing",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  accessibility: "/accessibility",
};
const status = {
  waiting: [Circle, "Waiting"],
  queued: [Clock3, "Queued"],
  running: [RefreshCw, "Running"],
  passed: [CheckCircle2, "Passed"],
  failed: [XCircle, "Failed"],
  skipped: [ArrowRight, "Skipped"],
  cancelled: [Square, "Cancelled"],
} as const;

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="logo">
      <span className="logo-mark">
        <GitBranch size={18} />
      </span>
      {!compact && (
        <span>
          Pipeline <b>Academy</b>
        </span>
      )}
    </span>
  );
}
function Pill({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="progress" aria-label={label || `${value}% complete`}>
      <span>
        <i style={{ width: `${value}%` }} />
      </span>
      {label && <small>{label}</small>}
    </div>
  );
}
function Page({
  children,
  narrow = false,
}: {
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return <div className={`page ${narrow ? "narrow" : ""}`}>{children}</div>;
}
function PageHead({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <header className="page-head">
      <Pill tone="cyan">{eyebrow}</Pill>
      <h1>{title}</h1>
      <p>{desc}</p>
    </header>
  );
}

export default function AcademyApp({
  initialView = "home",
}: {
  initialView?: View;
}) {
  const [view, setView] = useState<View>(initialView),
    [dark, setDark] = useState(true),
    [role, setRole] = useState<Role>("student"),
    [signed, setSigned] = useState(false),
    [search, setSearch] = useState(false),
    [mobile, setMobile] = useState(false),
    [toast, setToast] = useState("");
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem("pa-demo") || "{}");
      queueMicrotask(() => {
        setSigned(!!d.signed);
        setRole(d.role || "student");
        setDark(d.dark !== false);
      });
    } catch {}
  }, []);
  useEffect(() => {
    const onPopState = () => {
      const entry = Object.entries(paths).find(
        ([, path]) => path === location.pathname,
      );
      setView(
        (entry?.[0] as View) ||
          (location.pathname.startsWith("/learn")
            ? "lesson"
            : location.pathname.startsWith("/quiz")
              ? "quiz"
              : "home"),
      );
    };
    addEventListener("popstate", onPopState);
    return () => removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("pa-demo", JSON.stringify({ signed, role, dark }));
  }, [dark, role, signed]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);
  const nav = (v: View) => {
    setView(v);
    setMobile(false);
    history.pushState({}, "", paths[v]);
    scrollTo({ top: 0, behavior: "smooth" });
  };
  const login = (r: Role) => {
    setRole(r);
    setSigned(true);
    setToast(`Demo ${r} workspace loaded`);
    nav(r === "student" ? "dashboard" : r);
  };
  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <button className="brand" onClick={() => nav("home")}>
          <Logo />
        </button>
        <nav className="desktop-nav">
          <button onClick={() => nav("curriculum")}>Curriculum</button>
          <button onClick={() => nav("lab")}>Pipeline Lab</button>
          <button onClick={() => nav("glossary")}>Glossary</button>
          <button onClick={() => nav("pricing")}>Pricing</button>
        </nav>
        <div className="top-actions">
          <button
            className="search-button"
            onClick={() => setSearch(true)}
            aria-label="Search Pipeline Academy"
          >
            <Search />
            <span>Search</span>
            <kbd>⌘ K</kbd>
          </button>
          <button
            className="icon-btn"
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
          >
            {dark ? <Sun /> : <Moon />}
          </button>
          {signed ? (
            <button
              className="avatar"
              onClick={() => nav(role === "student" ? "dashboard" : role)}
              aria-label="Open demo workspace"
            >
              AM
            </button>
          ) : (
            <>
              <button
                className="text-btn desktop-only"
                onClick={() => nav("signin")}
              >
                Sign in
              </button>
              <button
                className="primary small desktop-only"
                onClick={() => nav("signin")}
              >
                Start free
              </button>
            </>
          )}
          <button
            className="icon-btn mobile-menu"
            onClick={() => setMobile(!mobile)}
            aria-label={
              mobile ? "Close navigation menu" : "Open navigation menu"
            }
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
        {mobile && (
          <nav className="mobile-nav">
            {[
              ["Curriculum", "curriculum"],
              ["Pipeline Lab", "lab"],
              ["Glossary", "glossary"],
              ["Pricing", "pricing"],
              [
                signed ? "Dashboard" : "Sign in",
                signed ? "dashboard" : "signin",
              ],
            ].map((x) => (
              <button key={x[0]} onClick={() => nav(x[1] as View)}>
                {x[0]}
              </button>
            ))}
          </nav>
        )}
      </header>
      <main id="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {view === "home" && <Landing nav={nav} />}{" "}
            {view === "curriculum" && <Curriculum nav={nav} />}{" "}
            {view === "dashboard" && <Dashboard nav={nav} />}{" "}
            {view === "lesson" && <Lesson nav={nav} toast={setToast} />}{" "}
            {view === "quiz" && <Quiz nav={nav} />}{" "}
            {view === "lab" && <Lab toast={setToast} />}{" "}
            {view === "glossary" && <Glossary />}{" "}
            {view === "signin" && <SignIn login={login} />}{" "}
            {view === "account" && (
              <Account role={role} setRole={setRole} toast={setToast} />
            )}{" "}
            {view === "instructor" && <Instructor toast={setToast} />}{" "}
            {view === "admin" && <Admin toast={setToast} />}{" "}
            {view === "about" && <About />}{" "}
            {view === "pricing" && <Pricing nav={nav} />}{" "}
            {view === "contact" && <Contact toast={setToast} />}{" "}
            {(["privacy", "terms", "accessibility"] as View[]).includes(
              view,
            ) && <Legal kind={view} />}
          </motion.div>
        </AnimatePresence>
      </main>
      {view === "home" && <Footer nav={nav} />}{" "}
      {search && <SearchDialog close={() => setSearch(false)} nav={nav} />}{" "}
      {toast && (
        <div className="toast">
          <CheckCircle2 />
          {toast}
        </div>
      )}
    </div>
  );
}

function Landing({ nav }: { nav: (v: View) => void }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <Pill tone="cyan">
            <Sparkles /> Interactive CI/CD course
          </Pill>
          <h1>
            Learn how code
            <br />
            <span>reaches production.</span>
          </h1>
          <p>
            Understand builds, tests, deployments, GitHub Actions, Docker,
            staging, and everything that happens after you push your code.
          </p>
          <div className="button-row">
            <button className="primary" onClick={() => nav("signin")}>
              Start learning for free <ArrowRight />
            </button>
            <button className="secondary" onClick={() => nav("lab")}>
              <Play /> Try Pipeline Lab
            </button>
          </div>
          <div className="hero-proof">
            <span>
              <Check /> No DevOps experience needed
            </span>
            <span>
              <Check /> Learn by doing
            </span>
            <span>
              <Check /> Free starter path
            </span>
          </div>
        </div>
        <div className="pipeline-window">
          <div className="window-bar">
            <span />
            <span />
            <span />
            <code>deploy #1842</code>
            <Pill tone="green">passed</Pill>
          </div>
          <div className="commit">
            <span className="avatar tiny">AM</span>
            <span>
              <b>feat: add team invitations</b>
              <small>main · a8f31c2 · just now</small>
            </span>
          </div>
          <div className="mini-pipeline">
            {[
              [GitBranch, "Push", "0.4s"],
              [Box, "Build", "18s"],
              [ShieldCheck, "Test", "32s"],
              [Zap, "Deploy", "11s"],
            ].map(([I, t, d], i) => {
              const Icon = I as typeof GitBranch;
              return (
                <div key={String(t)}>
                  <span className="stage-icon">
                    <Icon />
                  </span>
                  <span>
                    <b>{t as string}</b>
                    <small>{d as string}</small>
                  </span>
                  <CheckCircle2 className="green" />
                  {i < 3 && <i />}
                </div>
              );
            })}
          </div>
          <pre>
            <span>$</span> npm run deploy{"\n"}
            <em>› Building optimized production bundle…</em>
            {"\n"}
            <b>✓ Deployment ready at pipeline.academy</b>
          </pre>
        </div>
      </section>
      <section className="trust">
        <span>LEARN THE TOOLS TEAMS USE</span>
        <b>
          <Github /> GitHub Actions
        </b>
        <b>
          <Container /> Docker
        </b>
        <b>
          <Zap /> Vercel
        </b>
        <b>
          <Database /> Supabase
        </b>
      </section>
      <section className="section">
        <PageHead
          eyebrow="THE DELIVERY PATH"
          title="From commit to customer, see every step."
          desc="A pipeline is not magic. It is a set of understandable jobs connected in the right order."
        />
        <div className="concept-grid">
          {[
            [
              GitBranch,
              "Integrate with confidence",
              "Merge small changes often. Automated checks catch problems before main.",
            ],
            [
              ShieldCheck,
              "Build quality in",
              "Run linting, tests, and security scans on every important change.",
            ],
            [
              Zap,
              "Release without fear",
              "Promote one tested artifact through staging and production safely.",
            ],
          ].map(([I, t, d], i) => {
            const Icon = I as typeof GitBranch;
            return (
              <article key={String(t)}>
                <span className={`feature-icon f${i}`}>
                  <Icon />
                </span>
                <small>0{i + 1}</small>
                <h3>{t as string}</h3>
                <p>{d as string}</p>
                <button onClick={() => nav("curriculum")}>
                  Explore the curriculum <ArrowRight />
                </button>
              </article>
            );
          })}
        </div>
      </section>
      <section className="section course-preview">
        <PageHead
          eyebrow="14 MODULES · 12 HOURS"
          title="A practical path to production."
          desc="Start with the basics, build real workflows, then prove your skills in a complete release simulation."
        />
        <div className="module-list">
          {modules.slice(0, 6).map((m) => (
            <button
              key={m.id}
              onClick={() => nav(m.id === 1 ? "lesson" : "curriculum")}
            >
              <span className="module-num">
                {String(m.id).padStart(2, "0")}
              </span>
              <span>
                <b>{m.title}</b>
                <small>{m.summary}</small>
              </span>
              <Pill tone={m.id < 3 ? "green" : "blue"}>{m.difficulty}</Pill>
              <span>{m.minutes} min</span>
              <ChevronRight />
            </button>
          ))}
        </div>
        <button
          className="secondary centered"
          onClick={() => nav("curriculum")}
        >
          View all 14 modules <ArrowRight />
        </button>
      </section>
      <section className="section lab-promo">
        <div>
          <Pill tone="green">
            <Bot /> HANDS-ON SIMULATOR
          </Pill>
          <h2>
            Break the pipeline.
            <br />
            <span>Then learn to fix it.</span>
          </h2>
          <p>
            Run realistic workflows, inspect logs, diagnose failures, approve
            releases, and roll back unhealthy deployments.
          </p>
          <ul>
            <li>
              <CheckCircle2 /> 14 animated pipeline stages
            </li>
            <li>
              <CheckCircle2 /> Realistic logs and failure scenarios
            </li>
            <li>
              <CheckCircle2 /> Guided diagnosis with hints
            </li>
          </ul>
          <button className="primary" onClick={() => nav("lab")}>
            Open Pipeline Lab <ArrowRight />
          </button>
        </div>
        <div className="failure-card">
          <div>
            <XCircle />
            <span>
              <b>Unit tests failed</b>
              <small>Stage 5 of 14 · 3.2s</small>
            </span>
            <Pill tone="red">failed</Pill>
          </div>
          <pre>
            FAIL src/cart.test.ts{"\n"}
            <span>Expected: 42</span>
            {"\n"}
            <b>Received: 21</b>
            {"\n\n"}Tests: 1 failed, 27 passed
          </pre>
          <p>
            <Lightbulb />
            <span>
              <b>Your task</b>
              <small>
                The cart total ignores item quantity. Find and apply the fix.
              </small>
            </span>
          </p>
          <button onClick={() => nav("lab")}>
            Inspect failure <ArrowRight />
          </button>
        </div>
      </section>
      <section className="section testimonials">
        <PageHead
          eyebrow="BUILT FOR BEGINNERS"
          title="Technical, never intimidating."
          desc="Real skills, explained in clear language."
        />
        <div>
          {[
            [
              "I finally understand what happens between opening a pull request and seeing a feature live.",
              "Maya Chen",
              "Junior developer",
            ],
            [
              "Pipeline logs feel useful instead of scary now.",
              "Noah Williams",
              "CS student",
            ],
            [
              "A shared delivery vocabulary in one afternoon.",
              "Priya Raman",
              "Engineering manager",
            ],
          ].map((q) => (
            <blockquote key={q[1]}>
              <span>★★★★★</span>
              <p>“{q[0]}”</p>
              <footer>
                <span className="avatar tiny">
                  {q[1]
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <span>
                  <b>{q[1]}</b>
                  <small>{q[2]}</small>
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="section faq">
        <PageHead
          eyebrow="FAQ"
          title="Questions before your first push?"
          desc="Everything you need to begin."
        />
        {[
          [
            "Do I need DevOps experience?",
            "No. Git, YAML, Docker, tests, and deployment concepts start from first principles.",
          ],
          [
            "Is Pipeline Lab connected to real clouds?",
            "No. It uses safe, realistic simulations and never needs production credentials.",
          ],
          [
            "How long does the course take?",
            "About 12 hours, split into short lessons. Demo progress is saved on this device.",
          ],
          [
            "Can teams use it for onboarding?",
            "Yes. The Team experience supports assignments and progress visibility.",
          ],
        ].map((x, i) => (
          <details key={x[0]} open={i === 0}>
            <summary>
              {x[0]}
              <ChevronDown />
            </summary>
            <p>{x[1]}</p>
          </details>
        ))}
      </section>
      <section className="final-cta">
        <GitBranch />
        <h2>Your next push can make sense.</h2>
        <p>
          Build the mental model and practical skills behind modern software
          delivery.
        </p>
        <button className="primary" onClick={() => nav("signin")}>
          Start learning for free <ArrowRight />
        </button>
      </section>
    </>
  );
}

function Curriculum({ nav }: { nav: (v: View) => void }) {
  const [filter, setFilter] = useState("All");
  return (
    <Page>
      <PageHead
        eyebrow="LEARNING PATH"
        title="Master modern software delivery."
        desc="Fourteen focused modules move from fundamentals to a production release."
      />
      <div className="filters">
        {["All", "Beginner", "Intermediate", "Advanced"].map((f) => (
          <button
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
            key={f}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="curriculum-grid">
        {modules
          .filter((m) => filter === "All" || m.difficulty === filter)
          .map((m, i) => (
            <article key={m.id}>
              <div>
                <span className="module-num">
                  {String(m.id).padStart(2, "0")}
                </span>
                <Pill
                  tone={
                    m.difficulty === "Beginner"
                      ? "green"
                      : m.difficulty === "Advanced"
                        ? "violet"
                        : "blue"
                  }
                >
                  {m.difficulty}
                </Pill>
              </div>
              <h3>{m.title}</h3>
              <p>{m.summary}</p>
              <div className="topics">
                {m.topics.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="module-meta">
                <span>
                  <BookOpen /> 2 lessons
                </span>
                <span>
                  <Clock3 /> {m.minutes} min
                </span>
                <span>
                  <HelpCircle /> 5 questions
                </span>
              </div>
              {i === 0 && filter === "All" ? (
                <>
                  <Progress value={50} label="1 of 2 lessons complete" />
                  <button
                    className="primary full"
                    onClick={() => nav("lesson")}
                  >
                    Continue module <ArrowRight />
                  </button>
                </>
              ) : (
                <button
                  className="secondary full"
                  onClick={() => nav("lesson")}
                >
                  View module <ArrowRight />
                </button>
              )}
            </article>
          ))}
      </div>
    </Page>
  );
}

function SideNav({ nav, active }: { nav: (v: View) => void; active: string }) {
  return (
    <aside className="side-nav">
      <Logo compact />
      <div>
        {[
          [Home, "dashboard"],
          [BookOpen, "curriculum"],
          [Bot, "lab"],
          [BookMarked, "glossary"],
          [Award, "account"],
        ].map(([I, v]) => {
          const Icon = I as typeof Home;
          return (
            <button
              key={String(v)}
              className={active === v ? "active" : ""}
              onClick={() => nav(v as View)}
            >
              <Icon />
            </button>
          );
        })}
      </div>
      <div>
        <button onClick={() => nav("account")}>
          <Settings />
        </button>
        <span className="avatar tiny">AM</span>
      </div>
    </aside>
  );
}
function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="stat">
      <span>
        <Icon />
      </span>
      <div>
        <small>{label}</small>
        <b>{value}</b>
        <p>{sub}</p>
      </div>
    </div>
  );
}

function Dashboard({ nav }: { nav: (v: View) => void }) {
  const data = [
    { d: "M", v: 18 },
    { d: "T", v: 34 },
    { d: "W", v: 21 },
    { d: "T", v: 48 },
    { d: "F", v: 36 },
    { d: "S", v: 62 },
    { d: "S", v: 45 },
  ];
  return (
    <div className="workspace">
      <SideNav nav={nav} active="dashboard" />
      <div className="workspace-main">
        <header className="workspace-head">
          <div>
            <small>TUESDAY, JULY 14</small>
            <h1>Good afternoon, Alex.</h1>
            <p>Keep the momentum going—your next lesson is ready.</p>
          </div>
          <button className="primary" onClick={() => nav("lesson")}>
            Continue learning <ArrowRight />
          </button>
        </header>
        <div className="stat-grid">
          <Stat
            icon={Gauge}
            label="Course progress"
            value="18%"
            sub="5 of 28 lessons"
          />
          <Stat
            icon={Zap}
            label="Learning streak"
            value="6 days"
            sub="Personal best: 9"
          />
          <Stat
            icon={Trophy}
            label="Quiz average"
            value="88%"
            sub="4 quizzes passed"
          />
          <Stat
            icon={Clock3}
            label="Time learning"
            value="3h 42m"
            sub="+48m this week"
          />
        </div>
        <div className="dashboard-grid">
          <section className="panel continue">
            <div className="panel-title">
              <span>
                <Pill tone="cyan">UP NEXT</Pill>
                <h2>What happens after code is written?</h2>
              </span>
              <span>Module 1 · Lesson 2</span>
            </div>
            <p>
              Follow one feature through review, checks, staging, and
              production.
            </p>
            <div className="lesson-preview">
              <span className="feature-icon f0">
                <GitBranch />
              </span>
              <span>
                <small>SOFTWARE DELIVERY BASICS</small>
                <b>Branches, reviews, and environments</b>
                <Progress value={35} />
              </span>
              <button onClick={() => nav("lesson")}>
                <ArrowRight />
              </button>
            </div>
          </section>
          <section className="panel">
            <div className="panel-title">
              <h3>Learning time</h3>
              <span>Last 7 days</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39c6f4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#39c6f4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--line)"
                />
                <XAxis dataKey="d" axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#39c6f4"
                  fill="url(#area)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </section>
          <section className="panel recommendations">
            <div className="panel-title">
              <h3>Recommended for you</h3>
              <button onClick={() => nav("curriculum")}>View all</button>
            </div>
            {modules.slice(2, 5).map((m) => (
              <button key={m.id} onClick={() => nav("lesson")}>
                <span className="module-num">
                  {String(m.id).padStart(2, "0")}
                </span>
                <span>
                  <b>{m.title}</b>
                  <small>{m.summary}</small>
                </span>
                <span>{m.minutes} min</span>
                <ChevronRight />
              </button>
            ))}
          </section>
          <section className="panel">
            <div className="panel-title">
              <h3>Recent achievements</h3>
              <button onClick={() => nav("account")}>View all</button>
            </div>
            <div className="achievements">
              {achievements.slice(0, 3).map((a, i) => (
                <div key={a[0]}>
                  <span className={`achievement a${i}`}>
                    <Award />
                  </span>
                  <b>{a[0]}</b>
                  <small>{a[1]}</small>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Lesson({
  nav,
  toast,
}: {
  nav: (v: View) => void;
  toast: (s: string) => void;
}) {
  const [done, setDone] = useState(false),
    [note, setNote] = useState("");
  return (
    <div className="lesson-layout">
      <aside className="course-side">
        <button className="back" onClick={() => nav("curriculum")}>
          <ArrowLeft /> Curriculum
        </button>
        <div>
          <small>MODULE 1</small>
          <b>Software Delivery Basics</b>
          <Progress value={50} label="1 of 2 complete" />
        </div>
        {[
          "From idea to production",
          "Branches, reviews, environments",
          "Module quiz",
        ].map((l, i) => (
          <button className={i === 0 ? "active" : ""} key={l}>
            {i === 0 ? <CheckCircle2 /> : i === 2 ? <HelpCircle /> : <Circle />}
            <span>
              <small>{i === 2 ? "ASSESSMENT" : `LESSON ${i + 1}`}</small>
              {l}
            </span>
          </button>
        ))}
      </aside>
      <article className="lesson">
        <div className="breadcrumbs">
          Curriculum <ChevronRight /> Module 1 <ChevronRight /> Lesson 1
        </div>
        <Pill tone="cyan">LESSON 1 OF 2</Pill>
        <h1>From idea to production</h1>
        <p className="lead">
          See the full journey of a software change—and where a CI/CD pipeline
          helps.
        </p>
        <div className="lesson-meta">
          <span>
            <Clock3 /> 18 minutes
          </span>
          <span>
            <BookOpen /> Beginner
          </span>
          <button onClick={() => toast("Lesson bookmarked")}>
            <BookMarked /> Bookmark
          </button>
        </div>
        <section className="objectives">
          <Lightbulb />
          <div>
            <h3>By the end of this lesson, you can:</h3>
            <ul>
              <li>Describe the environments code moves through</li>
              <li>Explain commits, pull requests, and reviews</li>
              <li>Place delivery steps in a safe order</li>
            </ul>
          </div>
        </section>
        <LessonSection title="Shipping software is a journey">
          <p>
            Writing code is only the beginning. Before customers use a feature,
            the change must be stored, reviewed, verified, packaged, and
            released. A <b>CI/CD pipeline</b> automates the repeatable parts of
            that journey.
          </p>
          <div className="definition">
            <b>CI/CD pipeline</b>
            <p>
              An automated workflow that compiles code, runs checks, creates a
              release-ready artifact, and safely handles deployments.
            </p>
          </div>
        </LessonSection>
        <LessonSection title="Three environments, three jobs">
          <div className="env-flow">
            {[
              [Code2, "Development", "Write and try changes", "Your laptop"],
              [ShieldCheck, "Staging", "Run final checks", "Team access"],
              [Zap, "Production", "Serve real users", "Customer access"],
            ].map(([I, t, d, s], i) => {
              const Icon = I as typeof Code2;
              return (
                <div key={String(t)}>
                  <Icon />
                  <small>0{i + 1}</small>
                  <h3>{t as string}</h3>
                  <p>{d as string}</p>
                  <Pill tone={i === 2 ? "green" : "blue"}>{s as string}</Pill>
                </div>
              );
            })}
          </div>
        </LessonSection>
        <LessonSection title="Put the delivery steps in order">
          <Ordering toast={toast} />
        </LessonSection>
        <LessonSection title="Key idea">
          <blockquote>
            Automation does not remove judgment. It gives teams reliable
            evidence so people can make safer release decisions.
          </blockquote>
        </LessonSection>
        <section className="notes">
          <div className="panel-title">
            <h3>Your notes</h3>
            <span>{note ? "Saved" : "Saved locally in demo mode"}</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a reminder in your own words…"
          />
        </section>
        <div className="lesson-actions">
          <button className="secondary" onClick={() => nav("curriculum")}>
            <ArrowLeft /> Curriculum
          </button>
          <button
            className={done ? "success" : "primary"}
            onClick={() => {
              setDone(true);
              toast("Lesson complete — +120 XP");
            }}
          >
            {done ? (
              <>
                <CheckCircle2 /> Completed
              </>
            ) : (
              <>
                Mark complete <Check />
              </>
            )}
          </button>
          <button className="primary" onClick={() => nav("quiz")}>
            Knowledge check <ArrowRight />
          </button>
        </div>
      </article>
      <aside className="toc">
        <small>ON THIS PAGE</small>
        {[
          "Shipping software",
          "Three environments",
          "Order the steps",
          "Key idea",
          "Your notes",
        ].map((x) => (
          <a href="#" key={x}>
            {x}
          </a>
        ))}
        <button onClick={() => toast("Issue report opened")}>
          <AlertTriangle /> Report an issue
        </button>
      </aside>
    </div>
  );
}
function LessonSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="lesson-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Ordering({ toast }: { toast: (s: string) => void }) {
  const correct = [
      "Commit the change",
      "Open a pull request",
      "Run automated checks",
      "Review and merge",
      "Deploy to staging",
      "Release to production",
    ],
    [items, setItems] = useState([
      correct[2],
      correct[0],
      correct[4],
      correct[1],
      correct[5],
      correct[3],
    ]);
  const move = (i: number, d: number) => {
    const n = [...items],
      j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    setItems(n);
  };
  return (
    <div className="ordering">
      <header>
        <span>
          <Command /> Arrange the steps
        </span>
        <Pill tone="violet">INTERACTIVE</Pill>
      </header>
      <p>Use the arrows to put this workflow in the safest order.</p>
      {items.map((x, i) => (
        <div key={x}>
          <span>{i + 1}</span>
          <b>{x}</b>
          <span>
            <button onClick={() => move(i, -1)} disabled={!i}>
              ↑
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
            >
              ↓
            </button>
          </span>
        </div>
      ))}
      <button
        className="primary"
        onClick={() =>
          toast(
            items.every((x, i) => x === correct[i])
              ? "Correct — safe sequence!"
              : "Not quite. Open the pull request before checks.",
          )
        }
      >
        Check order
      </button>
    </div>
  );
}

function Quiz({ nav }: { nav: (v: View) => void }) {
  const [q, setQ] = useState(0),
    [choice, setChoice] = useState<number | null>(null),
    [answers, setAnswers] = useState<number[]>([]),
    [done, setDone] = useState(false);
  const item = quizQuestions[q],
    score = answers.filter((a, i) => a === quizQuestions[i].correct).length;
  const submit = () => {
    if (choice === null) return;
    const next = [...answers, choice];
    setAnswers(next);
    if (q === quizQuestions.length - 1) setDone(true);
    else {
      setQ(q + 1);
      setChoice(null);
    }
  };
  if (done)
    return (
      <Page narrow>
        <div className="result">
          <span>{score * 20}%</span>
          <Pill tone={score >= 4 ? "green" : "yellow"}>
            {score >= 4 ? "PASSED" : "KEEP LEARNING"}
          </Pill>
          <h1>{score >= 4 ? "Excellent work." : "You’re close."}</h1>
          <p>
            {score} of {quizQuestions.length} correct. Review every explanation
            below.
          </p>
          {quizQuestions.map((x, i) => (
            <div
              className={answers[i] === x.correct ? "correct" : "wrong"}
              key={x.question}
            >
              {answers[i] === x.correct ? <CheckCircle2 /> : <XCircle />}
              <span>
                <b>{x.question}</b>
                <small>{x.explanation}</small>
              </span>
            </div>
          ))}
          <div className="button-row">
            <button
              className="secondary"
              onClick={() => {
                setQ(0);
                setChoice(null);
                setAnswers([]);
                setDone(false);
              }}
            >
              <RefreshCw /> Retry
            </button>
            <button className="primary" onClick={() => nav("dashboard")}>
              Dashboard <ArrowRight />
            </button>
          </div>
        </div>
      </Page>
    );
  return (
    <Page narrow>
      <div className="quiz-top">
        <button onClick={() => nav("lesson")}>
          <X /> Exit quiz
        </button>
        <span>CI/CD Foundations</span>
        <span>Question {q + 1} of 5</span>
      </div>
      <Progress value={(q + 1) * 20} />
      <div className="quiz-card">
        <Pill tone="violet">MULTIPLE CHOICE</Pill>
        <h1>{item.question}</h1>
        <p>Choose the best answer.</p>
        <div>
          {item.answers.map((a, i) => (
            <button
              className={choice === i ? "selected" : ""}
              onClick={() => setChoice(i)}
              key={a}
            >
              <span>{String.fromCharCode(65 + i)}</span>
              {a}
              {choice === i && <Check />}
            </button>
          ))}
        </div>
        <button
          className="primary full"
          disabled={choice === null}
          onClick={submit}
        >
          {q === 4 ? "Finish quiz" : "Submit answer"}
          <ArrowRight />
        </button>
      </div>
    </Page>
  );
}

function Lab({ toast }: { toast: (s: string) => void }) {
  const [scenarioId, setScenarioId] = useState("lint"),
    [stages, setStages] = useState<PipelineStage[]>(freshStages()),
    [running, setRunning] = useState(false),
    [fixed, setFixed] = useState(false),
    [selected, setSelected] = useState(0),
    [approval, setApproval] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    scenario = scenarios.find((s) => s.id === scenarioId)!,
    active = stages[selected];
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const step = (idx: number) => {
    if (idx >= 14) {
      setRunning(false);
      toast("Pipeline deployed successfully");
      return;
    }
    if (idx === 10) {
      setApproval(true);
      setRunning(false);
      setSelected(10);
      setStages((s) =>
        s.map((x, i) =>
          i === 10
            ? {
                ...x,
                status: "queued",
                log: "Awaiting authorized production approval…",
              }
            : x,
        ),
      );
      return;
    }
    setSelected(idx);
    setStages((s) =>
      s.map((x, i) =>
        i === idx
          ? {
              ...x,
              status: "running",
              log: `$ ${x.name.toLowerCase()}\nJob started on ubuntu-latest…`,
            }
          : x,
      ),
    );
    timer.current = setTimeout(
      () =>
        setStages((s) => {
          const fail = !fixed && idx === scenario.stage,
            next: PipelineStage[] = s.map((x, i) =>
              i === idx
                ? {
                    ...x,
                    status: fail ? "failed" : "passed",
                    duration: `${(2.1 + idx * 1.7).toFixed(1)}s`,
                    log: fail
                      ? scenario.log
                      : `$ ${x.name.toLowerCase()}\n✓ Completed successfully`,
                  }
                : x,
            );
          if (fail) {
            setRunning(false);
            toast(`${scenario.name} stopped the pipeline`);
          } else setTimeout(() => step(idx + 1), 80);
          return next;
        }),
      450,
    );
  };
  const start = (from = 0) => {
    if (timer.current) clearTimeout(timer.current);
    setApproval(false);
    setStages((s) =>
      from
        ? s.map((x, i) =>
            i >= from ? { ...x, status: "waiting", duration: "—" } : x,
          )
        : freshStages(),
    );
    setRunning(true);
    setTimeout(() => step(from), 40);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    setRunning(false);
    setStages((s) =>
      s.map((x) =>
        x.status === "running" || x.status === "queued"
          ? { ...x, status: "cancelled" }
          : x,
      ),
    );
    toast("Pipeline cancelled");
  };
  const approve = () => {
    setApproval(false);
    setStages((s) =>
      s.map((x, i) =>
        i === 10
          ? {
              ...x,
              status: "passed",
              duration: "12s",
              log: "✓ Approved by Alex Morgan",
            }
          : x,
      ),
    );
    setRunning(true);
    setTimeout(() => step(11), 50);
  };
  return (
    <div className="lab">
      <header className="lab-head">
        <div>
          <Pill tone="cyan">
            <Activity /> PIPELINE LAB
          </Pill>
          <h1>
            Release pipeline <span>#1842</span>
          </h1>
          <p>
            feat: add team invitations · <code>a8f31c2</code> · main · Alex
            Morgan
          </p>
        </div>
        <div>
          <select
            value={scenarioId}
            onChange={(e) => {
              setScenarioId(e.target.value);
              setFixed(false);
              setStages(freshStages());
            }}
          >
            {scenarios.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {running ? (
            <>
              <button
                className="secondary"
                onClick={() => {
                  setRunning(false);
                  if (timer.current) clearTimeout(timer.current);
                }}
              >
                <Pause /> Pause
              </button>
              <button className="danger" onClick={cancel}>
                <Square /> Cancel
              </button>
            </>
          ) : (
            <button className="primary" onClick={() => start(0)}>
              <Play /> Run pipeline
            </button>
          )}
        </div>
      </header>
      <div className="lab-grid">
        <section className="stage-panel">
          <div className="panel-title">
            <h3>Pipeline stages</h3>
            <span>
              {stages.filter((s) => s.status === "passed").length}/14 passed
            </span>
          </div>
          {stages.map((s, i) => {
            const [Icon, label] = status[s.status];
            return (
              <button
                className={`${s.status} ${selected === i ? "selected" : ""}`}
                onClick={() => setSelected(i)}
                key={s.name}
              >
                <span>
                  <Icon />
                </span>
                <code>{String(i + 1).padStart(2, "0")}</code>
                <span>
                  <b>{s.name}</b>
                  <small>{label}</small>
                </span>
                <code>{s.duration}</code>
                <ChevronRight />
              </button>
            );
          })}
        </section>
        <section className="logs">
          <header>
            <span>
              <TerminalSquare /> Stage {selected + 1}: {active.name}
            </span>
            <Pill
              tone={
                active.status === "failed"
                  ? "red"
                  : active.status === "passed"
                    ? "green"
                    : "blue"
              }
            >
              {status[active.status][1]}
            </Pill>
          </header>
          <pre>{active.log}</pre>
          {active.status === "failed" && (
            <div className="diagnose">
              <div>
                <AlertTriangle />
                <span>
                  <b>{scenario.name}</b>
                  <small>
                    The pipeline stopped to protect later environments.
                  </small>
                </span>
              </div>
              <p>{scenario.hint}</p>
              <div className="button-row">
                <button
                  className="secondary"
                  onClick={() => toast(`Hint: ${scenario.hint}`)}
                >
                  <Lightbulb /> Hint
                </button>
                {!fixed ? (
                  <button
                    className="primary"
                    onClick={() => {
                      setFixed(true);
                      toast(`${scenario.fix} applied`);
                    }}
                  >
                    {scenario.fix}
                  </button>
                ) : (
                  <button
                    className="primary"
                    onClick={() => start(scenario.stage)}
                  >
                    <RefreshCw /> Rerun failed job
                  </button>
                )}
              </div>
            </div>
          )}
          {approval && selected === 10 && (
            <div className="approval">
              <ShieldCheck />
              <h3>Staging is ready for review</h3>
              <p>All checks passed. Promote the same artifact to production?</p>
              <div className="button-row">
                <button
                  className="danger"
                  onClick={() => {
                    setApproval(false);
                    toast("Deployment rejected");
                  }}
                >
                  Reject
                </button>
                <button className="primary" onClick={approve}>
                  Approve production
                </button>
              </div>
            </div>
          )}
          <div className="run-details">
            {[
              ["Trigger", "push"],
              ["Runner", "ubuntu-latest"],
              [
                "Environment",
                selected < 9 ? "CI" : selected < 11 ? "staging" : "production",
              ],
              ["Artifact", "web-a8f31c2.tgz"],
            ].map((x) => (
              <div key={x[0]}>
                <small>{x[0]}</small>
                <b>{x[1]}</b>
              </div>
            ))}
          </div>
          <div className="history">
            <div className="panel-title">
              <h3>Recent runs</h3>
              <span>Compare execution</span>
            </div>
            {[
              [1841, "passed", "2m 09s"],
              [1840, "failed", "48s"],
              [1839, "passed", "2m 13s"],
            ].map((r) => (
              <div key={r[0]}>
                <Pill tone={r[1] === "passed" ? "green" : "red"}>{r[1]}</Pill>
                <b>deploy #{r[0]}</b>
                <span>main</span>
                <code>{r[2]}</code>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Glossary() {
  const [q, setQ] = useState("");
  const rows = glossary.filter(([a, b]) =>
    (a + b).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <Page>
      <PageHead
        eyebrow="REFERENCE"
        title="CI/CD glossary"
        desc="Clear definitions for modern software delivery."
      />
      <label className="big-search">
        <Search />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search terms and definitions…"
        />
      </label>
      <div className="glossary">
        {rows.map(([term, def]) => (
          <article key={term}>
            <span>{term[0]}</span>
            <div>
              <h3>{term}</h3>
              <p>{def}</p>
              <button>
                View related lessons <ArrowRight />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!rows.length && (
        <div className="empty">
          <Search />
          <h3>No terms found</h3>
          <p>Try CI, artifact, deployment, or YAML.</p>
        </div>
      )}
    </Page>
  );
}

function SignIn({ login }: { login: (r: Role) => void }) {
  const [role, setRole] = useState<Role>("student");
  return (
    <div className="auth">
      <section>
        <Logo />
        <div>
          <Pill tone="cyan">DEMO MODE</Pill>
          <h1>Practice software delivery without risking production.</h1>
          <p>
            Choose a workspace to explore learner, teaching, and administration
            workflows.
          </p>
          <div className="auth-icons">
            {[GitBranch, ShieldCheck, Box, Zap].map((I, i) => (
              <span key={i}>
                <I />
              </span>
            ))}
          </div>
        </div>
        <small>Local demo data · No real credentials required</small>
      </section>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login(role);
        }}
      >
        <h2>Create your learning workspace</h2>
        <p>Start the free CI/CD fundamentals path.</p>
        <div className="role-picker">
          {(["student", "instructor", "admin"] as Role[]).map((r) => (
            <button
              type="button"
              className={role === r ? "active" : ""}
              onClick={() => setRole(r)}
              key={r}
            >
              {r === "student" ? (
                <User />
              ) : r === "instructor" ? (
                <BookOpen />
              ) : (
                <ShieldCheck />
              )}
              <span>
                <b>{r[0].toUpperCase() + r.slice(1)}</b>
                <small>
                  {r === "student"
                    ? "Learn and practice"
                    : r === "instructor"
                      ? "Create content"
                      : "Manage the platform"}
                </small>
              </span>
            </button>
          ))}
        </div>
        <label>
          Email address
          <input type="email" defaultValue={`${role}@pipeline.academy`} />
        </label>
        <label>
          Password
          <input type="password" defaultValue="demo-access" />
        </label>
        <button className="primary full" type="submit">
          Enter demo workspace <ArrowRight />
        </button>
        <div className="auth-note">
          <LockKeyhole /> Credentials stay on this device.
        </div>
      </form>
    </div>
  );
}

function Account({
  role,
  setRole,
  toast,
}: {
  role: Role;
  setRole: (r: Role) => void;
  toast: (s: string) => void;
}) {
  return (
    <Page>
      <PageHead
        eyebrow="YOUR ACCOUNT"
        title="Profile and preferences"
        desc="Personalize your learning experience and notifications."
      />
      <div className="settings">
        <aside>
          {[User, BookOpen, Bell, Award, Trophy, LockKeyhole].map((I, i) => (
            <button className={i === 0 ? "active" : ""} key={i}>
              <I />
              {
                [
                  "Profile",
                  "Learning preferences",
                  "Notifications",
                  "Achievements",
                  "Certificates",
                  "Security",
                ][i]
              }
            </button>
          ))}
        </aside>
        <section className="panel">
          <div className="profile">
            <span className="avatar large">AM</span>
            <span>
              <h3>Profile photo</h3>
              <p>PNG or JPG, up to 2 MB.</p>
              <button
                className="secondary"
                onClick={() => toast("Demo avatar updated")}
              >
                Upload new photo
              </button>
            </span>
          </div>
          <div className="form-grid">
            <label>
              Display name
              <input defaultValue="Alex Morgan" />
            </label>
            <label>
              Username
              <input defaultValue="alexmorgan" />
            </label>
            <label>
              Experience
              <select>
                <option>New developer</option>
                <option>Junior developer</option>
              </select>
            </label>
            <label>
              Preferred language
              <select>
                <option>TypeScript</option>
                <option>Python</option>
                <option>Go</option>
              </select>
            </label>
            <label>
              Demo role
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Administrator</option>
              </select>
            </label>
          </div>
          <label>
            Learning goals
            <textarea defaultValue="Understand GitHub Actions and diagnose pipeline failures." />
          </label>
          <div className="button-row end">
            <button
              className="secondary"
              onClick={() => toast("Progress export prepared")}
            >
              Export progress
            </button>
            <button className="primary" onClick={() => toast("Profile saved")}>
              Save changes
            </button>
          </div>
        </section>
      </div>
    </Page>
  );
}

function Instructor({ toast }: { toast: (s: string) => void }) {
  const [draft, setDraft] = useState(
    "A pipeline is a sequence of automated jobs that verifies and delivers software safely.",
  );
  return (
    <div className="workspace">
      <SideNav nav={() => {}} active="instructor" />
      <div className="workspace-main">
        <header className="workspace-head">
          <div>
            <small>INSTRUCTOR WORKSPACE</small>
            <h1>Course studio</h1>
            <p>Create, review, and publish learning content.</p>
          </div>
          <button
            className="primary"
            onClick={() => toast("New lesson draft created")}
          >
            <Code2 /> New lesson
          </button>
        </header>
        <div className="stat-grid">
          <Stat
            icon={BookOpen}
            label="Published lessons"
            value="28"
            sub="14 modules"
          />
          <Stat
            icon={Users}
            label="Active learners"
            value="1,284"
            sub="+12% this month"
          />
          <Stat
            icon={Trophy}
            label="Quiz pass rate"
            value="84%"
            sub="Across all modules"
          />
          <Stat
            icon={AlertTriangle}
            label="Content reports"
            value="3"
            sub="2 need review"
          />
        </div>
        <div className="studio">
          <section className="panel editor">
            <div className="panel-title">
              <span>
                <Pill tone="yellow">DRAFT</Pill>
                <h3>What is a CI/CD pipeline?</h3>
              </span>
              <span>
                <button
                  className="secondary"
                  onClick={() => toast("Preview opened")}
                >
                  Preview
                </button>
                <button
                  className="primary"
                  onClick={() => toast("Lesson published")}
                >
                  Publish
                </button>
              </span>
            </div>
            <label>
              Lesson title
              <input defaultValue="What is a CI/CD pipeline?" />
            </label>
            <label>
              Lesson content
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </label>
            <small>{draft.length} characters · Autosaved</small>
          </section>
          <section className="panel content-list">
            <div className="panel-title">
              <h3>Course structure</h3>
              <button onClick={() => toast("Module added")}>
                + Add module
              </button>
            </div>
            {modules.slice(0, 7).map((m, i) => (
              <div key={m.id}>
                <span>⠿</span>
                <span>
                  <b>{m.title}</b>
                  <small>2 lessons · 1 quiz</small>
                </span>
                <Pill tone={i < 4 ? "green" : "yellow"}>
                  {i < 4 ? "Published" : "Draft"}
                </Pill>
                <button>
                  <Settings />
                </button>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

function Admin({ toast }: { toast: (s: string) => void }) {
  const users = ["Alex Morgan", "Maya Chen", "Noah Williams", "Priya Raman"];
  return (
    <div className="workspace">
      <SideNav nav={() => {}} active="admin" />
      <div className="workspace-main">
        <header className="workspace-head">
          <div>
            <small>ADMINISTRATION</small>
            <h1>Platform overview</h1>
            <p>Learning health, users, and operational signals.</p>
          </div>
          <button
            className="secondary"
            onClick={() => toast("Announcement composer opened")}
          >
            <Bell /> New announcement
          </button>
        </header>
        <div className="stat-grid">
          <Stat
            icon={Users}
            label="Total users"
            value="8,492"
            sub="+184 this month"
          />
          <Stat
            icon={Activity}
            label="Weekly active"
            value="3,106"
            sub="36.5% of users"
          />
          <Stat
            icon={Trophy}
            label="Completion rate"
            value="41.8%"
            sub="+3.2 points"
          />
          <Stat
            icon={ShieldCheck}
            label="Reports open"
            value="7"
            sub="3 high priority"
          />
        </div>
        <div className="admin-panels">
          <section className="panel">
            <div className="panel-title">
              <h3>User management</h3>
              <label className="inline-search">
                <Search />
                <input placeholder="Search users" />
              </label>
            </div>
            <div className="user-table">
              <header>
                <span>User</span>
                <span>Role</span>
                <span>Progress</span>
                <span>Status</span>
                <span />
              </header>
              {users.map((u, i) => (
                <div key={u}>
                  <span>
                    <span className="avatar tiny">
                      {u
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <span>
                      <b>{u}</b>
                      <small>
                        {u.toLowerCase().replace(" ", ".")}@example.com
                      </small>
                    </span>
                  </span>
                  <span>{i === 3 ? "Instructor" : "Student"}</span>
                  <span>{[18, 64, 42, 100][i]}%</span>
                  <Pill tone="green">Active</Pill>
                  <button onClick={() => toast(`${u} actions opened`)}>
                    •••
                  </button>
                </div>
              ))}
            </div>
          </section>
          <section className="panel reports">
            <div className="panel-title">
              <h3>Needs attention</h3>
              <button>View reports</button>
            </div>
            {[
              ["Quiz question report", "Ambiguous answer in Module 6", "high"],
              ["Lesson issue", "Broken Docker lesson link", "medium"],
              ["Support request", "Certificate name correction", "low"],
            ].map((x) => (
              <div key={x[0]}>
                <AlertTriangle />
                <span>
                  <b>{x[0]}</b>
                  <small>{x[1]}</small>
                </span>
                <Pill
                  tone={
                    x[2] === "high"
                      ? "red"
                      : x[2] === "medium"
                        ? "yellow"
                        : "blue"
                  }
                >
                  {x[2]}
                </Pill>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <Page>
      <PageHead
        eyebrow="OUR PURPOSE"
        title="Make software delivery understandable."
        desc="Pipeline Academy turns an invisible process into a clear path learners can see, practice, and explain."
      />
      <div className="story">
        <article>
          <h2>Why CI/CD knowledge matters</h2>
          <p>
            Modern developers do more than write code. They collaborate through
            source control, respond to automated checks, interpret deployment
            signals, and help recover from incidents.
          </p>
          <p>
            These skills should not be learned only after something breaks. We
            teach the mental model first, then make it concrete through
            realistic simulations.
          </p>
        </article>
        <div>
          {[
            [BookOpen, "Clear before clever"],
            [Bot, "Practice beats memorization"],
            [ShieldCheck, "Safety is a team skill"],
            [Users, "Built for onboarding"],
          ].map(([I, t]) => {
            const Icon = I as typeof BookOpen;
            return (
              <div key={String(t)}>
                <Icon />
                <b>{t as string}</b>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
function Pricing({ nav }: { nav: (v: View) => void }) {
  return (
    <Page>
      <PageHead
        eyebrow="SIMPLE PRICING"
        title="Start free. Grow with your team."
        desc="Add deeper practice and team insights when you need them."
      />
      <div className="pricing">
        {[
          [
            "Free",
            "$0",
            "Core modules, 3 lab scenarios, quizzes, local progress",
          ],
          [
            "Pro",
            "$12",
            "All modules, full Pipeline Lab, projects, certificate",
          ],
          [
            "Team",
            "$29",
            "Everything in Pro, assignments, analytics, instructor tools",
          ],
        ].map((p, i) => (
          <article className={i === 1 ? "featured" : ""} key={p[0]}>
            {i === 1 && <Pill tone="cyan">MOST POPULAR</Pill>}
            <h3>{p[0]}</h3>
            <div>
              {p[1]}
              <small>{i ? "/ learner / month" : " forever"}</small>
            </div>
            <p>{p[2]}</p>
            <ul>
              {[
                "Beginner-friendly lessons",
                "Interactive exercises",
                "Progress tracking",
                i === 0
                  ? "Community support"
                  : i === 1
                    ? "Completion certificate"
                    : "Team administration",
              ].map((x) => (
                <li key={x}>
                  <Check /> {x}
                </li>
              ))}
            </ul>
            <button
              className={i === 1 ? "primary full" : "secondary full"}
              onClick={() => nav("signin")}
            >
              {i === 0
                ? "Start free"
                : i === 1
                  ? "Try Pro demo"
                  : "Explore Team demo"}
            </button>
          </article>
        ))}
      </div>
      <p className="pricing-note">
        Payments are disabled in demo mode. No card is collected.
      </p>
    </Page>
  );
}
function Contact({ toast }: { toast: (s: string) => void }) {
  const [sent, setSent] = useState(false);
  return (
    <Page>
      <PageHead
        eyebrow="SUPPORT"
        title="How can we help?"
        desc="Search common topics or describe the problem clearly."
      />
      {sent ? (
        <div className="success-state">
          <CheckCircle2 />
          <h2>Message received</h2>
          <p>
            We created support request PA-1042. No external message was sent in
            demo mode.
          </p>
          <button className="secondary" onClick={() => setSent(false)}>
            Send another
          </button>
        </div>
      ) : (
        <div className="contact">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              toast("Support request created");
            }}
          >
            <label>
              Category
              <select>
                <option>Course content</option>
                <option>Account access</option>
                <option>Pipeline Lab</option>
                <option>Report a problem</option>
              </select>
            </label>
            <label>
              Email
              <input type="email" required placeholder="you@example.com" />
            </label>
            <label>
              How can we help?
              <textarea
                required
                minLength={20}
                placeholder="Include what you expected and what happened…"
              />
            </label>
            <button className="primary">
              Send request <ArrowRight />
            </button>
          </form>
          <aside>
            <h3>Common help topics</h3>
            {[
              "Reset demo progress",
              "Understand quiz scoring",
              "Troubleshoot Pipeline Lab",
              "Update certificate name",
            ].map((x) => (
              <button key={x}>
                {x}
                <ChevronRight />
              </button>
            ))}
          </aside>
        </div>
      )}
    </Page>
  );
}
function Legal({ kind }: { kind: View }) {
  const title =
    kind === "privacy"
      ? "Privacy policy"
      : kind === "terms"
        ? "Terms of service"
        : "Accessibility statement";
  return (
    <Page narrow>
      <PageHead
        eyebrow="PIPELINE ACADEMY"
        title={title}
        desc="Last updated July 14, 2026"
      />
      <article className="legal">
        <h2>Our commitment</h2>
        <p>
          Pipeline Academy is designed to earn trust through clear defaults,
          limited data collection, and inclusive experiences. This demonstration
          stores preferences and learning progress only in your browser.
        </p>
        <h2>
          {kind === "accessibility"
            ? "Accessible learning"
            : "Information we handle"}
        </h2>
        <p>
          {kind === "accessibility"
            ? "We target WCAG 2.2 AA with semantic structure, keyboard access, visible focus, text alternatives, adequate contrast, and reduced-motion support."
            : "Production deployments may store account, profile, progress, quiz, and support data. Sensitive credentials are never stored in frontend code."}
        </p>
        <h2>Contact</h2>
        <p>
          Questions can be submitted through support. Policies are reviewed as
          capabilities and regulations change.
        </p>
      </article>
    </Page>
  );
}

function SearchDialog({
  close,
  nav,
}: {
  close: () => void;
  nav: (v: View) => void;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(
    () =>
      [
        ...modules.map((m) => ({
          title: m.title,
          sub: m.summary,
          view: "curriculum" as View,
        })),
        ...glossary.map(([a, b]) => ({
          title: a,
          sub: b,
          view: "glossary" as View,
        })),
      ]
        .filter((x) =>
          (x.title + x.sub).toLowerCase().includes(q.toLowerCase()),
        )
        .slice(0, 7),
    [q],
  );
  return (
    <div
      className="dialog"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section role="dialog">
        <label>
          <Search />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lessons, terms, and topics…"
          />
          <button onClick={close}>
            <X />
          </button>
        </label>
        <div>
          {q ? (
            results.map((r) => (
              <button
                key={r.title}
                onClick={() => {
                  close();
                  nav(r.view);
                }}
              >
                <span className="feature-icon f0">
                  <BookOpen />
                </span>
                <span>
                  <b>{r.title}</b>
                  <small>{r.sub}</small>
                </span>
                <ArrowRight />
              </button>
            ))
          ) : (
            <>
              <small>TRY SEARCHING FOR</small>
              {["Continuous Integration", "YAML", "Rollback", "Docker"].map(
                (x) => (
                  <button key={x} onClick={() => setQ(x)}>
                    <Search />
                    {x}
                  </button>
                ),
              )}
            </>
          )}
        </div>
        <footer>
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> Navigate
          </span>
          <span>
            <kbd>ESC</kbd> Close
          </span>
        </footer>
      </section>
    </div>
  );
}
function Footer({ nav }: { nav: (v: View) => void }) {
  return (
    <footer className="footer">
      <div>
        <Logo />
        <p>Understand how code reaches production.</p>
        <small>© 2026 Pipeline Academy</small>
      </div>
      {[
        [
          "Learn",
          [
            ["Curriculum", "curriculum"],
            ["Pipeline Lab", "lab"],
            ["Glossary", "glossary"],
          ],
        ],
        [
          "Company",
          [
            ["About", "about"],
            ["Pricing", "pricing"],
            ["Contact", "contact"],
          ],
        ],
        [
          "Legal",
          [
            ["Privacy", "privacy"],
            ["Terms", "terms"],
            ["Accessibility", "accessibility"],
          ],
        ],
      ].map(([h, links]) => (
        <div key={String(h)}>
          <b>{h as string}</b>
          {(links as string[][]).map((l) => (
            <button key={l[0]} onClick={() => nav(l[1] as View)}>
              {l[0]}
            </button>
          ))}
        </div>
      ))}
    </footer>
  );
}
