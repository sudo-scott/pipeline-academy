import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const id = () => text("id").primaryKey();
const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
};

export const users = sqliteTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    role: text("role", { enum: ["student", "instructor", "admin"] })
      .notNull()
      .default("student"),
    status: text("status").notNull().default("active"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("users_email_uq").on(t.email),
    index("users_role_idx").on(t.role),
  ],
);
export const profiles = sqliteTable(
  "profiles",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    username: text("username").notNull(),
    avatarUrl: text("avatar_url"),
    experience: text("experience"),
    goals: text("goals"),
    language: text("language"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("profiles_user_uq").on(t.userId),
    uniqueIndex("profiles_username_uq").on(t.username),
  ],
);
export const courses = sqliteTable(
  "courses",
  {
    id: id(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: text("status").notNull().default("draft"),
    ...timestamps,
  },
  (t) => [uniqueIndex("courses_slug_uq").on(t.slug)],
);
export const modules = sqliteTable(
  "modules",
  {
    id: id(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    position: integer("position").notNull(),
    difficulty: text("difficulty").notNull(),
    estimatedMinutes: integer("estimated_minutes").notNull(),
    status: text("status").notNull().default("draft"),
    ...timestamps,
  },
  (t) => [uniqueIndex("modules_course_position_uq").on(t.courseId, t.position)],
);
export const lessons = sqliteTable(
  "lessons",
  {
    id: id(),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    position: integer("position").notNull(),
    estimatedMinutes: integer("estimated_minutes").notNull(),
    status: text("status").notNull().default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("lessons_module_slug_uq").on(t.moduleId, t.slug),
    index("lessons_module_position_idx").on(t.moduleId, t.position),
  ],
);
export const lessonSections = sqliteTable(
  "lesson_sections",
  {
    id: id(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    title: text("title"),
    content: text("content").notNull(),
    position: integer("position").notNull(),
    ...timestamps,
  },
  (t) => [index("sections_lesson_position_idx").on(t.lessonId, t.position)],
);
export const enrollments = sqliteTable(
  "enrollments",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    enrolledAt: integer("enrolled_at", { mode: "timestamp" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (t) => [uniqueIndex("enrollments_user_course_uq").on(t.userId, t.courseId)],
);
export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    percent: integer("percent").notNull().default(0),
    readingPosition: integer("reading_position").notNull().default(0),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    lastViewedAt: integer("last_viewed_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [
    uniqueIndex("lesson_progress_user_lesson_uq").on(t.userId, t.lessonId),
  ],
);
export const quizzes = sqliteTable("quizzes", {
  id: id(),
  moduleId: text("module_id").references(() => modules.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  passingScore: integer("passing_score").notNull().default(80),
  shuffleQuestions: integer("shuffle_questions", { mode: "boolean" })
    .notNull()
    .default(true),
  ...timestamps,
});
export const questions = sqliteTable(
  "questions",
  {
    id: id(),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    prompt: text("prompt").notNull(),
    explanation: text("explanation").notNull(),
    hint: text("hint"),
    position: integer("position").notNull(),
    ...timestamps,
  },
  (t) => [index("questions_quiz_position_idx").on(t.quizId, t.position)],
);
export const answerChoices = sqliteTable(
  "answer_choices",
  {
    id: id(),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    isCorrect: integer("is_correct", { mode: "boolean" })
      .notNull()
      .default(false),
    position: integer("position").notNull(),
  },
  (t) => [index("choices_question_idx").on(t.questionId)],
);
export const quizAttempts = sqliteTable(
  "quiz_attempts",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    passed: integer("passed", { mode: "boolean" }).notNull(),
    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("attempts_user_quiz_idx").on(t.userId, t.quizId)],
);
export const quizResponses = sqliteTable(
  "quiz_responses",
  {
    id: id(),
    attemptId: text("attempt_id")
      .notNull()
      .references(() => quizAttempts.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    response: text("response").notNull(),
    correct: integer("correct", { mode: "boolean" }).notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
  },
  (t) => [
    uniqueIndex("responses_attempt_question_uq").on(t.attemptId, t.questionId),
  ],
);
export const projects = sqliteTable("projects", {
  id: id(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  instructions: text("instructions").notNull(),
  gradingRules: text("grading_rules").notNull(),
  ...timestamps,
});
export const projectAttempts = sqliteTable(
  "project_attempts",
  {
    id: id(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    configuration: text("configuration").notNull(),
    score: integer("score"),
    status: text("status").notNull(),
    ...timestamps,
  },
  (t) => [index("project_attempts_user_idx").on(t.userId)],
);
export const achievements = sqliteTable(
  "achievements",
  {
    id: id(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    xp: integer("xp").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("achievements_slug_uq").on(t.slug)],
);
export const userAchievements = sqliteTable(
  "user_achievements",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    earnedAt: integer("earned_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [uniqueIndex("user_achievements_uq").on(t.userId, t.achievementId)],
);
export const bookmarks = sqliteTable(
  "bookmarks",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [uniqueIndex("bookmarks_user_lesson_uq").on(t.userId, t.lessonId)],
);
export const notes = sqliteTable(
  "notes",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    ...timestamps,
  },
  (t) => [index("notes_user_lesson_idx").on(t.userId, t.lessonId)],
);
export const notifications = sqliteTable(
  "notifications",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    readAt: integer("read_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("notifications_user_read_idx").on(t.userId, t.readAt)],
);
export const certificates = sqliteTable(
  "certificates",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    certificateCode: text("certificate_code").notNull(),
    finalScore: integer("final_score").notNull(),
    issuedAt: integer("issued_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [uniqueIndex("certificates_code_uq").on(t.certificateCode)],
);
export const pipelineScenarios = sqliteTable(
  "pipeline_scenarios",
  {
    id: id(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    failureStage: integer("failure_stage").notNull(),
    log: text("log").notNull(),
    hint: text("hint").notNull(),
    fix: text("fix").notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("pipeline_scenarios_slug_uq").on(t.slug)],
);
export const pipelineRuns = sqliteTable(
  "pipeline_runs",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scenarioId: text("scenario_id")
      .notNull()
      .references(() => pipelineScenarios.id, { onDelete: "cascade" }),
    commitHash: text("commit_hash").notNull(),
    branch: text("branch").notNull(),
    status: text("status").notNull(),
    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (t) => [index("pipeline_runs_user_created_idx").on(t.userId, t.startedAt)],
);
export const pipelineStages = sqliteTable(
  "pipeline_stages",
  {
    id: id(),
    runId: text("run_id")
      .notNull()
      .references(() => pipelineRuns.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    position: integer("position").notNull(),
    status: text("status").notNull(),
    log: text("log").notNull(),
    durationMs: integer("duration_ms"),
  },
  (t) => [
    uniqueIndex("pipeline_stages_run_position_uq").on(t.runId, t.position),
  ],
);
export const reports = sqliteTable(
  "reports",
  {
    id: id(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    reason: text("reason").notNull(),
    status: text("status").notNull().default("open"),
    ...timestamps,
  },
  (t) => [index("reports_status_idx").on(t.status)],
);
export const userSettings = sqliteTable(
  "user_settings",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    theme: text("theme").notNull().default("dark"),
    notifications: text("notifications").notNull().default("{}"),
    reducedMotion: integer("reduced_motion", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (t) => [uniqueIndex("user_settings_user_uq").on(t.userId)],
);
