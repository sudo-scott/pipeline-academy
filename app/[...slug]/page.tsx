import AcademyApp from "../academy-app";

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
  return (
    <AcademyApp initialView={initial as (typeof known)[number] | "home"} />
  );
}
