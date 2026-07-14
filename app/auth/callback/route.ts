import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { siteUrl } from "../../../lib/site-url";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextValue = url.searchParams.get("next") ?? "/dashboard";
  const next = nextValue.startsWith("/") && !nextValue.startsWith("//")
    ? nextValue
    : "/dashboard";

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${siteUrl()}${next}`);
    } catch {
      // Fall through to a safe sign-in error page.
    }
  }
  return NextResponse.redirect(`${siteUrl()}/signin?error=invalid-link`);
}
