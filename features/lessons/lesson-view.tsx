"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { allLessons } from "../../lib/lesson-content";

type LessonRecord = (typeof allLessons)[number];

export function LessonView({
  item,
  openLesson,
  onCurriculum,
  onQuiz,
  toast,
}: {
  item: LessonRecord;
  openLesson: (moduleId: number, lessonIndex: number) => void;
  onCurriculum: () => void;
  onQuiz: () => void;
  toast: (message: string) => void;
}) {
  const [done, setDone] = useState(false);
  const [note, setNote] = useState("");
  const [syncReady, setSyncReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    void fetch(`/api/beta/state?lessonId=${encodeURIComponent(item.id)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load progress");
        return response.json() as Promise<{
          lesson: { completed: boolean; note: string };
        }>;
      })
      .then((state) => {
        setDone(state.lesson.completed);
        setNote(state.lesson.note);
        setSyncReady(true);
      })
      .catch(() => toast("Progress sync is temporarily unavailable"));
  }, [item.id, toast]);

  useEffect(() => {
    if (!syncReady) return;
    const timer = setTimeout(() => {
      setSyncing(true);
      void fetch("/api/beta/state", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "lesson.save",
          lessonId: item.id,
          completed: done,
          note,
        }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Unable to sync progress");
          setSyncing(false);
        })
        .catch(() => {
          setSyncing(false);
          toast("Your latest lesson change could not be synced");
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [done, item.id, note, syncReady, toast]);

  const index = allLessons.findIndex((lessonItem) => lessonItem.id === item.id);
  const next = allLessons[index + 1];
  const progress = Math.round(((index + 1) / allLessons.length) * 100);

  return (
    <div className="lesson-layout">
      <aside className="course-side">
        <button className="back" onClick={onCurriculum}>
          <ArrowLeft /> Curriculum
        </button>
        <div>
          <small>MODULE {item.module.id}</small>
          <b>{item.module.title}</b>
          <div className="progress" aria-label={`${progress}% through course`}>
            <span><i style={{ width: `${progress}%` }} /></span>
            <small>{index + 1} of {allLessons.length} lessons</small>
          </div>
        </div>
        {item.module.lessons.map((moduleLesson, lessonIndex) => (
          <button
            className={moduleLesson.id === item.id ? "active" : ""}
            key={moduleLesson.id}
            onClick={() => openLesson(item.module.id, lessonIndex)}
          >
            {moduleLesson.id === item.id ? <CheckCircle2 /> : <Circle />}
            <span>
              <small>LESSON {lessonIndex + 1}</small>
              {moduleLesson.title}
            </span>
          </button>
        ))}
        {item.module.id === 1 && (
          <button onClick={onQuiz}>
            <HelpCircle />
            <span><small>ASSESSMENT</small>Module knowledge check</span>
          </button>
        )}
      </aside>

      <article className="lesson">
        <div className="breadcrumbs">
          Curriculum <ChevronRight /> Module {item.module.id} <ChevronRight /> Lesson {item.lessonIndex + 1}
        </div>
        <span className="pill cyan">LESSON {index + 1} OF {allLessons.length}</span>
        <h1>{item.title}</h1>
        <p className="lead">{item.module.summary}</p>
        <div className="lesson-meta">
          <span><Clock3 /> {item.minutes} minutes</span>
          <span><BookOpen /> {item.module.difficulty}</span>
          <button onClick={() => toast("Lesson bookmarked")}><BookMarked /> Bookmark</button>
        </div>

        <section className="objectives" id="objectives">
          <Lightbulb />
          <div>
            <h3>By the end of this lesson, you can:</h3>
            <ul>{item.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
          </div>
        </section>

        <section className="lesson-section lesson-prerequisites" id="prerequisites">
          <h2>Prerequisites</h2>
          <ul>{item.prerequisites.map((value) => <li key={value}>{value}</li>)}</ul>
        </section>

        {item.concepts.map((concept, conceptIndex) => (
          <section className="lesson-section" id={`concept-${conceptIndex + 1}`} key={concept.title}>
            <h2>{concept.title}</h2>
            {concept.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}

        <section className="lesson-section" id="terms">
          <h2>Important terminology</h2>
          <div className="term-list">
            {item.terms.map(([term, definition]) => (
              <div className="definition" key={term}><b>{term}</b><p>{definition}</p></div>
            ))}
          </div>
        </section>

        <section className="lesson-section" id="method">
          <h2>Step-by-step method</h2>
          <ol className="lesson-steps">
            {item.method.map((step, stepIndex) => (
              <li key={step}><span>{stepIndex + 1}</span><p>{step}</p></li>
            ))}
          </ol>
        </section>

        <section className="lesson-section worked-example" id="example">
          <h2>Worked example: {item.example.title}</h2>
          <p><b>Scenario:</b> {item.example.scenario}</p>
          <ol>{item.example.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          <div className="definition"><b>Result</b><p>{item.example.result}</p></div>
        </section>

        <section className="lesson-section mistakes" id="mistakes">
          <h2>Common mistakes</h2>
          <ul>{item.mistakes.map((mistake) => <li key={mistake}><AlertTriangle /> {mistake}</li>)}</ul>
        </section>

        <section className="lesson-section lesson-check" id="knowledge-check">
          <h2>Knowledge check</h2>
          <p>{item.check.question}</p>
          <div className="check-options">
            {item.check.answers.map((answer, answerIndex) => (
              <button
                className={checked ? answerIndex === item.check.correct ? "correct" : choice === answerIndex ? "wrong" : "" : choice === answerIndex ? "selected" : ""}
                key={answer}
                onClick={() => { setChoice(answerIndex); setChecked(false); }}
              >
                <span>{String.fromCharCode(65 + answerIndex)}</span>{answer}
              </button>
            ))}
          </div>
          <button className="primary" disabled={choice === null} onClick={() => setChecked(true)}>Check answer</button>
          {checked && (
            <div className={`check-feedback ${choice === item.check.correct ? "correct" : "wrong"}`}>
              <b>{choice === item.check.correct ? "Correct" : "Review this idea"}</b>
              <p>{item.check.explanation}</p>
            </div>
          )}
        </section>

        <section className="lesson-section practice-exercise" id="practice">
          <h2>Practice exercise</h2>
          <p>{item.practice.prompt}</p>
          <div className="practice-controls">
            <button className="secondary" onClick={() => setShowHint((value) => !value)}><Lightbulb /> {showHint ? "Hide hint" : "Show hint"}</button>
            <button className="secondary" onClick={() => setShowAnswer((value) => !value)}><Check /> {showAnswer ? "Hide answer" : "Show answer"}</button>
          </div>
          {showHint && <div className="definition"><b>Hint</b><p>{item.practice.hint}</p></div>}
          {showAnswer && <div className="definition"><b>Answer and explanation</b><p>{item.practice.answer}</p></div>}
        </section>

        <section className="lesson-section lesson-summary" id="summary">
          <h2>Lesson summary</h2>
          <ul>{item.summary.map((point) => <li key={point}><CheckCircle2 /> {point}</li>)}</ul>
        </section>

        <section className="notes" id="notes">
          <div className="panel-title"><h3>Your notes</h3><span>{syncing ? "Syncing..." : syncReady ? "Synced" : "Loading..."}</span></div>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Write a reminder in your own words..." />
        </section>

        <div className="lesson-actions">
          <button className="secondary" onClick={onCurriculum}><ArrowLeft /> Curriculum</button>
          <button className={done ? "success" : "primary"} onClick={() => { setDone(true); toast("Lesson complete - progress synced"); }}>
            {done ? <><CheckCircle2 /> Completed</> : <>Mark complete <Check /></>}
          </button>
          {next ? (
            <button className="primary" onClick={() => openLesson(next.module.id, next.lessonIndex)}>Next lesson <ArrowRight /></button>
          ) : (
            <button className="primary" onClick={onQuiz}>Knowledge check <ArrowRight /></button>
          )}
        </div>
      </article>

      <aside className="toc">
        <small>ON THIS PAGE</small>
        <a href="#objectives">Objectives</a>
        <a href="#prerequisites">Prerequisites</a>
        <a href="#terms">Terminology</a>
        <a href="#example">Worked example</a>
        <a href="#knowledge-check">Knowledge check</a>
        <a href="#practice">Practice</a>
        <a href="#summary">Summary</a>
        <button onClick={() => toast("Issue report opened")}><AlertTriangle /> Report an issue</button>
      </aside>
    </div>
  );
}
