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

type BetaStateResponse = {
  challenge: {
    draft: string;
    submissions: DemoSubmission[];
  };
};

async function betaRequest(
  challengeId: string,
  body?: Record<string, unknown>,
): Promise<BetaStateResponse> {
  const response = await fetch(
    `/api/beta/state?challengeId=${encodeURIComponent(challengeId)}`,
    body
      ? {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }
      : undefined,
  );
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Sign in to save progress"
        : "Progress sync is temporarily unavailable",
    );
  return response.json() as Promise<BetaStateResponse>;
}

class BetaChallengeProvider implements ChallengePersistenceProvider {
  async loadDraft(challengeId: string) {
    const state = await betaRequest(challengeId);
    return state.challenge.draft || null;
  }
  async saveDraft(challengeId: string, source: string) {
    await betaRequest(challengeId, {
      type: "challenge.saveDraft",
      challengeId,
      source,
    });
  }
  async listSubmissions(challengeId: string) {
    const state = await betaRequest(challengeId);
    return state.challenge.submissions;
  }
  async saveSubmission(challengeId: string, submission: DemoSubmission) {
    const state = await betaRequest(challengeId, {
      type: "challenge.submit",
      challengeId,
      submission,
    });
    return state.challenge.submissions;
  }
}

export const challengePersistence: ChallengePersistenceProvider =
  new BetaChallengeProvider();

export const providerStatus = {
  authentication: "supabase-magic-link",
  database: "supabase-postgres",
  email: "captured-locally",
  github: "simulated-webhook-events",
  pipeline: "deterministic-stage-engine",
  deployment: "simulated-environments",
  storage: "metadata-only-demo",
  payments: "disabled-demo",
  analytics: "beta-events-pending",
} as const;
