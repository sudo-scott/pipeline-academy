import { z } from "zod";
import { ensureBetaViewer } from "../../../../lib/beta-server";
import {
  createSupabaseServerClient,
  isSupabaseConfigured,
} from "../../../../lib/supabase/server";

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
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? ensureBetaViewer(user) : null;
}

async function readState(userId: string, challengeId = "fix-node-pipeline") {
  const supabase = await createSupabaseServerClient();
  const [lessonResult, challengeResult] = await Promise.all([
    supabase
      .from("beta_lesson_state")
      .select("completed,note,updated_at")
      .eq("user_id", userId)
      .eq("lesson_id", "software-delivery")
      .maybeSingle(),
    supabase
      .from("beta_challenge_state")
      .select("draft,submissions,updated_at")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .maybeSingle(),
  ]);
  if (lessonResult.error) throw new Error(lessonResult.error.message);
  if (challengeResult.error) throw new Error(challengeResult.error.message);
  const lesson = lessonResult.data;
  const challenge = challengeResult.data;
  return {
    lesson: {
      completed: Boolean(lesson?.completed),
      note: lesson?.note ?? "",
      updatedAt: lesson?.updated_at ?? null,
    },
    challenge: {
      draft: challenge?.draft ?? "",
      submissions: Array.isArray(challenge?.submissions)
        ? challenge.submissions
        : [],
      updatedAt: challenge?.updated_at ?? null,
    },
  };
}

export async function GET(request: Request) {
  const viewer = await authenticated();
  if (!viewer)
    return Response.json({ error: "Authentication required" }, { status: 401 });
  const challengeId =
    new URL(request.url).searchParams.get("challengeId") ?? "fix-node-pipeline";
  return Response.json({ viewer, ...(await readState(viewer.userId, challengeId)) });
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

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();
  const value = parsed.data;
  let challengeId = "fix-node-pipeline";
  let error: { message: string } | null = null;

  if (value.type === "lesson.save") {
    ({ error } = await supabase.from("beta_lesson_state").upsert(
      {
        user_id: viewer.userId,
        lesson_id: value.lessonId,
        completed: value.completed,
        note: value.note,
        updated_at: now,
      },
      { onConflict: "user_id,lesson_id" },
    ));
  } else if (value.type === "challenge.saveDraft") {
    challengeId = value.challengeId;
    ({ error } = await supabase.from("beta_challenge_state").upsert(
      {
        user_id: viewer.userId,
        challenge_id: value.challengeId,
        draft: value.source,
        updated_at: now,
      },
      { onConflict: "user_id,challenge_id" },
    ));
  } else {
    challengeId = value.challengeId;
    const current = await supabase
      .from("beta_challenge_state")
      .select("submissions")
      .eq("user_id", viewer.userId)
      .eq("challenge_id", value.challengeId)
      .maybeSingle();
    if (current.error) throw new Error(current.error.message);
    const previous = Array.isArray(current.data?.submissions)
      ? current.data.submissions
      : [];
    ({ error } = await supabase.from("beta_challenge_state").upsert(
      {
        user_id: viewer.userId,
        challenge_id: value.challengeId,
        draft: value.submission.source,
        submissions: [value.submission, ...previous].slice(0, 20),
        updated_at: now,
      },
      { onConflict: "user_id,challenge_id" },
    ));
  }
  if (error) throw new Error(error.message);
  return Response.json({
    viewer,
    ...(await readState(viewer.userId, challengeId)),
  });
}
