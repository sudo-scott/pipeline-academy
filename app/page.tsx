import AcademyApp from "./academy-app";
import { getOptionalBetaViewer } from "../lib/beta-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const viewer = await getOptionalBetaViewer();
  return <AcademyApp initialView="home" viewer={viewer} />;
}
