import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
  isSupabaseConfigured,
} from "./supabase/server";

export type BetaRole = "student" | "instructor" | "admin";
export type BetaViewer = {
  userId: string;
  displayName: string;
  email: string;
  role: BetaRole;
};

export async function ensureBetaViewer(user: User): Promise<BetaViewer> {
  const email = user.email;
  if (!email) throw new Error("The signed-in account has no email address.");

  const displayName =
    stringMetadata(user.user_metadata.full_name) ??
    stringMetadata(user.user_metadata.name) ??
    email.split("@")[0];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("beta_members")
    .upsert(
      {
        user_id: user.id,
        email,
        display_name: displayName,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("user_id,email,display_name,role")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create the beta member record.");
  }

  return {
    userId: data.user_id,
    email: data.email,
    displayName: data.display_name,
    role: data.role as BetaRole,
  };
}

export async function getOptionalBetaViewer(): Promise<BetaViewer | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? ensureBetaViewer(user) : null;
}

export async function requireBetaViewer(
  returnTo: string,
  allowedRoles: BetaRole[] = ["student", "instructor", "admin"],
): Promise<BetaViewer> {
  const viewer = await getOptionalBetaViewer();
  if (!viewer) redirect(`/signin?next=${encodeURIComponent(safeReturnTo(returnTo))}`);
  if (!allowedRoles.includes(viewer.role)) redirect("/dashboard");
  return viewer;
}

function safeReturnTo(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function stringMetadata(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
