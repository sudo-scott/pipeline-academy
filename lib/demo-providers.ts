export type DemoSubmission = {
  score: number;
  status: string;
  source: string;
  time: string;
};

export interface ChallengePersistenceProvider {
  loadDraft(challengeId: string): Promise<string | null>;
  saveDraft(challengeId: string, source: string): Promise<void>;
  listSubmissions(challengeId: string): Promise<DemoSubmission[]>;
  saveSubmission(
    challengeId: string,
    submission: DemoSubmission,
  ): Promise<DemoSubmission[]>;
}

class BrowserDemoChallengeProvider implements ChallengePersistenceProvider {
  async loadDraft(challengeId: string) {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(`pa:draft:${challengeId}`);
    return raw ? (JSON.parse(raw).source as string) : null;
  }
  async saveDraft(challengeId: string, source: string) {
    localStorage.setItem(
      `pa:draft:${challengeId}`,
      JSON.stringify({ source, updatedAt: new Date().toISOString() }),
    );
  }
  async listSubmissions(challengeId: string) {
    if (typeof window === "undefined") return [];
    return JSON.parse(
      localStorage.getItem(`pa:submissions:${challengeId}`) || "[]",
    ) as DemoSubmission[];
  }
  async saveSubmission(challengeId: string, submission: DemoSubmission) {
    const next = [
      submission,
      ...(await this.listSubmissions(challengeId)),
    ].slice(0, 5);
    localStorage.setItem(`pa:submissions:${challengeId}`, JSON.stringify(next));
    return next;
  }
}

export const challengePersistence: ChallengePersistenceProvider =
  new BrowserDemoChallengeProvider();

export const providerStatus = {
  authentication: "deterministic-demo",
  database: "d1-schema-with-browser-demo-adapter",
  email: "captured-locally",
  github: "simulated-webhook-events",
  pipeline: "deterministic-stage-engine",
  deployment: "simulated-environments",
  storage: "metadata-only-demo",
  payments: "disabled-demo",
  analytics: "deterministic-seed-data",
} as const;
