import { getChatGPTUser } from "../../../chatgpt-auth";
import { betaDb, ensureBetaViewer } from "../../../../lib/beta-server";
import { z } from "zod";

const submission = z.object({
  score: z.number().int().min(0).max(100),
  status: z.enum(["Accepted", "Partially Correct", "Wrong Answer"]),
  source: z.string().max(50_000),
  time: z.string().max(80),
});

const action = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("lesson.save"),
    lessonId: z.string().min(1).max(120),
    completed: z.boolean(),
    note: z.string().max(4_000),
  }),
  z.object({
    type: z.literal("challenge.saveDraft"),
    challengeId: z.string().min(1).max(120),
    source: z.string().max(50_000),
  }),
  z.object({
    type: z.literal("challenge.submit"),
    challengeId: z.string().min(1).max(120),
    submission,
  }),
]);

async function authenticated() {
  const user = await getChatGPTUser();
  if (!user) return null;
  return ensureBetaViewer(user);
}

async function readState(email: string, challengeId = "fix-node-pipeline") {
  const db = await betaDb();
  const [lesson, challenge] = await Promise.all([
    db
      .prepare(
        `SELECT completed, note, updated_at AS updatedAt
         FROM beta_lesson_state WHERE email = ? AND lesson_id = ?`,
      )
      .bind(email, "software-delivery")
      .first<{ completed: number; note: string; updatedAt: number }>(),
    db
      .prepare(
        `SELECT draft, submissions, updated_at AS updatedAt
         FROM beta_challenge_state WHERE email = ? AND challenge_id = ?`,
      )
      .bind(email, challengeId)
      .first<{ draft: string; submissions: string; updatedAt: number }>(),
  ]);
  return {
    lesson: {
      completed: Boolean(lesson?.completed),
      note: lesson?.note ?? "",
      updatedAt: lesson?.updatedAt ?? null,
    },
    challenge: {
      draft: challenge?.draft ?? "",
      submissions: JSON.parse(challenge?.submissions ?? "[]") as unknown[],
      updatedAt: challenge?.updatedAt ?? null,
    },
  };
}

export async function GET(request: Request) {
  const viewer = await authenticated();
  if (!viewer)
    return Response.json({ error: "Authentication required" }, { status: 401 });
  const challengeId =
    new URL(request.url).searchParams.get("challengeId") ?? "fix-node-pipeline";
  return Response.json({
    viewer,
    ...(await readState(viewer.email, challengeId)),
  });
}

export async function POST(request: Request) {
  const viewer = await authenticated();
  if (!viewer)
    return Response.json({ error: "Authentication required" }, { status: 401 });
  const parsed = action.safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { error: "Invalid beta state update", issues: parsed.error.issues },
      { status: 400 },
    );

  const db = await betaDb();
  const now = Date.now();
  const value = parsed.data;
  let challengeId = "fix-node-pipeline";
  if (value.type === "lesson.save") {
    await db
      .prepare(
        `INSERT INTO beta_lesson_state (email, lesson_id, completed, note, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(email, lesson_id) DO UPDATE SET
           completed = excluded.completed,
           note = excluded.note,
           updated_at = excluded.updated_at`,
      )
      .bind(
        viewer.email,
        value.lessonId,
        value.completed ? 1 : 0,
        value.note,
        now,
      )
      .run();
  } else if (value.type === "challenge.saveDraft") {
    challengeId = value.challengeId;
    await db
      .prepare(
        `INSERT INTO beta_challenge_state (email, challenge_id, draft, submissions, updated_at)
         VALUES (?, ?, ?, '[]', ?)
         ON CONFLICT(email, challenge_id) DO UPDATE SET
           draft = excluded.draft,
           updated_at = excluded.updated_at`,
      )
      .bind(viewer.email, value.challengeId, value.source, now)
      .run();
  } else {
    challengeId = value.challengeId;
    const current = await db
      .prepare(
        "SELECT draft, submissions FROM beta_challenge_state WHERE email = ? AND challenge_id = ?",
      )
      .bind(viewer.email, value.challengeId)
      .first<{ draft: string; submissions: string }>();
    const history = [
      value.submission,
      ...(JSON.parse(current?.submissions ?? "[]") as unknown[]),
    ].slice(0, 20);
    await db
      .prepare(
        `INSERT INTO beta_challenge_state (email, challenge_id, draft, submissions, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(email, challenge_id) DO UPDATE SET
           draft = excluded.draft,
           submissions = excluded.submissions,
           updated_at = excluded.updated_at`,
      )
      .bind(
        viewer.email,
        value.challengeId,
        value.submission.source,
        JSON.stringify(history),
        now,
      )
      .run();
  }
  return Response.json({
    viewer,
    ...(await readState(viewer.email, challengeId)),
  });
}
