import { redirect } from "next/navigation";
import {
  getChatGPTUser,
  requireChatGPTUser,
  type ChatGPTUser,
} from "../app/chatgpt-auth";

export type BetaRole = "student" | "instructor" | "admin";
export type BetaViewer = {
  displayName: string;
  email: string;
  role: BetaRole;
};

async function database() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("The beta database is unavailable.");
  return env.DB;
}

export async function ensureBetaViewer(user: ChatGPTUser): Promise<BetaViewer> {
  const db = await database();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO beta_members (email, display_name, role, joined_at, last_seen_at)
       VALUES (?, ?, 'student', ?, ?)
       ON CONFLICT(email) DO UPDATE SET
         display_name = excluded.display_name,
         last_seen_at = excluded.last_seen_at`,
    )
    .bind(user.email, user.displayName, now, now)
    .run();
  const member = await db
    .prepare(
      "SELECT email, display_name AS displayName, role FROM beta_members WHERE email = ?",
    )
    .bind(user.email)
    .first<BetaViewer>();
  if (!member) throw new Error("Unable to create the beta member record.");
  return member;
}

export async function getOptionalBetaViewer(): Promise<BetaViewer | null> {
  const user = await getChatGPTUser();
  return user ? ensureBetaViewer(user) : null;
}

export async function requireBetaViewer(
  returnTo: string,
  allowedRoles: BetaRole[] = ["student", "instructor", "admin"],
): Promise<BetaViewer> {
  const user = await requireChatGPTUser(returnTo);
  const viewer = await ensureBetaViewer(user);
  if (!allowedRoles.includes(viewer.role)) redirect("/dashboard");
  return viewer;
}

export async function betaDb() {
  return database();
}
