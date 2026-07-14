import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { siteUrl } from "../../../lib/site-url";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // An absent session is already signed out.
  }
  return NextResponse.json({ ok: true, redirectTo: siteUrl() });
}
