import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureBetaViewer } from "../../../../lib/beta-server";
import { siteUrl } from "../../../../lib/site-url";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import {
  evaluateTesterAttempt,
  isTesterAccessEnabled,
  testerAccountEmail,
  testerRateFingerprint,
} from "../../../../lib/tester-access";

const requestSchema = z.object({ code: z.string().min(1).max(256) });
const testerIdSchema = z.string().uuid();
const noStoreHeaders = { "cache-control": "private, no-store" };

export async function POST(request: Request) {
  if (!isTesterAccessEnabled()) return unavailable(404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalid();
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return invalid();

  const configuredCode = process.env.TESTER_ACCESS_CODE;
  const clientIp = clientAddress(request);
  const fingerprint = configuredCode
    ? testerRateFingerprint(configuredCode, clientIp)
    : "unconfigured";

  try {
    const result = await evaluateTesterAttempt(
      {
        submittedCode: parsed.data.code,
        configuredCode,
        fingerprint,
      },
      {
        consumeAttempt: consumeAttempt,
        establishSession: establishTesterSession,
      },
    );
    if (result === "success")
      return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
    if (result === "rate_limited")
      return NextResponse.json(
        { error: "Too many attempts. Wait 15 minutes and try again." },
        { status: 429, headers: noStoreHeaders },
      );
    if (result === "unavailable") return unavailable(503);
    return invalid();
  } catch {
    return unavailable(503);
  }
}

async function consumeAttempt(fingerprint: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("consume_tester_access_attempt", {
    p_fingerprint: fingerprint,
    p_limit: 8,
    p_window_seconds: 900,
  });
  if (error || typeof data !== "boolean")
    throw new Error("Tester access rate limiting is unavailable.");
  return data;
}

async function establishTesterSession() {
  const cookieStore = await cookies();
  const existingId = testerIdSchema.safeParse(
    cookieStore.get("pa-tester-id")?.value,
  );
  const testerId = existingId.success ? existingId.data : randomUUID();
  const email = testerAccountEmail(testerId, new URL(siteUrl()).hostname);
  const admin = createSupabaseAdminClient();
  const { data: link, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        data: { full_name: "Temporary Tester", tester_access: true },
        redirectTo: `${siteUrl()}/dashboard`,
      },
    });
  if (linkError || !link.properties.hashed_token)
    throw new Error("Unable to create a temporary tester account.");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: link.properties.hashed_token,
    type: "magiclink",
  });
  if (error || !data.user)
    throw new Error("Unable to establish the temporary tester session.");
  await ensureBetaViewer(data.user);
  cookieStore.set("pa-tester-id", testerId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function clientAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function invalid() {
  return NextResponse.json(
    { error: "Tester access could not be verified." },
    { status: 401, headers: noStoreHeaders },
  );
}

function unavailable(status: 404 | 503) {
  return NextResponse.json(
    { error: "Tester access is unavailable." },
    { status, headers: noStoreHeaders },
  );
}
