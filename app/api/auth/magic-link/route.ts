import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { siteUrl } from "../../../../lib/site-url";

const requestSchema = z.object({ email: z.string().email().max(320) });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        emailRedirectTo: `${siteUrl()}/auth/callback?next=%2Fdashboard`,
        shouldCreateUser: true,
      },
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("environment variables")
        ? "Sign-in is not configured yet. Add the Supabase variables in Vercel."
        : "We could not send the sign-in link. Try again in a moment.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
