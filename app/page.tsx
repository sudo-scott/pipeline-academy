import AcademyApp from "./academy-app";
import { getOptionalBetaViewer } from "../lib/beta-server";
import { isTesterAccessEnabled } from "../lib/tester-access";

export const dynamic = "force-dynamic";

export default async function Home() {
  const viewer = await getOptionalBetaViewer();
  return (
    <AcademyApp
      initialView="home"
      testerAccessEnabled={isTesterAccessEnabled()}
      viewer={viewer}
    />
  );
}
