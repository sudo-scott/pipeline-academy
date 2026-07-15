import AcademyApp from "../academy-app";
import {
  getOptionalBetaViewer,
  requireBetaViewer,
  type BetaRole,
} from "../../lib/beta-server";
import { isTesterAccessEnabled } from "../../lib/tester-access";

export const dynamic = "force-dynamic";

const known = [
  "curriculum",
  "dashboard",
  "lesson",
  "quiz",
  "challenges",
  "challenge",
  "community",
  "leaderboard",
  "lab",
  "glossary",
  "signin",
  "account",
  "instructor",
  "admin",
  "about",
  "pricing",
  "contact",
  "privacy",
  "terms",
  "accessibility",
] as const;

export default async function CatchAll({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = `/${slug.join("/")}`;
  const initial = path.startsWith("/learn")
    ? "lesson"
    : path.startsWith("/challenge/")
      ? "challenge"
      : path === "/discuss"
        ? "community"
        : path.startsWith("/quiz")
          ? "quiz"
          : known.includes(slug[0] as (typeof known)[number])
            ? slug[0]
            : "home";
  const protectedViews = new Set([
    "dashboard",
    "lesson",
    "quiz",
    "challenge",
    "community",
    "account",
    "instructor",
    "admin",
  ]);
  const view = initial as (typeof known)[number] | "home";
  if (protectedViews.has(view))
    return <ProtectedApp initialView={view} returnTo={path} />;
  const viewer = await getOptionalBetaViewer();
  return (
    <AcademyApp
      initialView={view}
      testerAccessEnabled={isTesterAccessEnabled()}
      viewer={viewer}
    />
  );
}

async function ProtectedApp({
  initialView,
  returnTo,
}: {
  initialView: (typeof known)[number] | "home";
  returnTo: string;
}) {
  const roleRules: Partial<Record<string, BetaRole[]>> = {
    instructor: ["instructor", "admin"],
    admin: ["admin"],
  };
  const viewer = await requireBetaViewer(
    returnTo,
    roleRules[initialView] ?? ["student", "instructor", "admin"],
  );
  return (
    <AcademyApp
      initialView={initialView}
      testerAccessEnabled={isTesterAccessEnabled()}
      viewer={viewer}
    />
  );
}
