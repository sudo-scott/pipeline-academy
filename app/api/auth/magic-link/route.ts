import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { siteUrl } from "../../../../lib/site-url";

const requestSchema = z.object({ email: z.string().email().max(320) });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
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
    const details = authErrorDetails(error);
    console.error("Supabase magic-link request failed", details);
    return NextResponse.json({ error: details.userMessage }, { status: details.status });
  }
}

function authErrorDetails(error: unknown) {
  const value = error as { code?: string; message?: string; status?: number };
  if (value.message?.includes("environment variables")) {
    return {
      code: "configuration_missing",
      status: 503,
      userMessage: "Sign-in is not configured yet. Add the Supabase variables in Vercel.",
    };
  }
  const messages: Record<string, string> = {
    email_address_invalid: "Supabase rejected this email address. Check it and try again.",
    email_address_not_authorized:
      "Supabase's test email service cannot send to this address. Use a project member email or configure custom SMTP.",
    over_email_send_rate_limit:
      "Too many sign-in emails were requested. Wait a few minutes and try again.",
    over_request_rate_limit:
      "Too many sign-in attempts were made. Wait a few minutes and try again.",
  };
  return {
    code: value.code ?? "unknown_auth_error",
    status: value.status && value.status >= 400 ? value.status : 503,
    userMessage:
      (value.code && messages[value.code]) ??
      value.message ??
      "We could not send the sign-in link. Try again in a moment.",
  };
}
