import { createHash, createHmac, timingSafeEqual } from "node:crypto";

type TesterEnvironment = Partial<Pick<
  NodeJS.ProcessEnv,
  "ENABLE_TESTER_ACCESS" | "VERCEL_ENV" | "NODE_ENV" | "TESTER_ACCESS_CODE"
>>;

export type TesterAttemptResult =
  | "success"
  | "invalid"
  | "rate_limited"
  | "unavailable";

export function isTesterAccessEnabled(
  env: TesterEnvironment = process.env,
): boolean {
  if (env.ENABLE_TESTER_ACCESS !== "true") return false;
  if (env.VERCEL_ENV) return env.VERCEL_ENV !== "production";
  return env.NODE_ENV !== "production";
}

export function testerCodeMatches(submitted: string, configured: string) {
  const submittedDigest = createHash("sha256").update(submitted).digest();
  const configuredDigest = createHash("sha256").update(configured).digest();
  return timingSafeEqual(submittedDigest, configuredDigest);
}

export function testerRateFingerprint(configuredCode: string, clientIp: string) {
  return createHmac("sha256", configuredCode).update(clientIp).digest("hex");
}

export function testerAccountEmail(testerId: string, siteHostname: string) {
  const safeId = testerId.toLowerCase().replace(/[^a-f0-9]/g, "");
  const safeHost = siteHostname.toLowerCase().replace(/[^a-z0-9.-]/g, "");
  return `tester-${safeId}@${safeHost}`;
}

export async function evaluateTesterAttempt(
  input: {
    submittedCode: string;
    configuredCode?: string;
    fingerprint: string;
  },
  dependencies: {
    consumeAttempt: (fingerprint: string) => Promise<boolean>;
    establishSession: () => Promise<void>;
  },
): Promise<TesterAttemptResult> {
  if (!input.configuredCode) return "unavailable";
  if (!(await dependencies.consumeAttempt(input.fingerprint)))
    return "rate_limited";
  if (!testerCodeMatches(input.submittedCode, input.configuredCode))
    return "invalid";
  await dependencies.establishSession();
  return "success";
}
