export type Condition = "T2DM" | "HYPERTENSION" | "COPD";

export interface MhealthApp {
  id: string;
  name: string;
  category: Condition;
  platform: string;
  storeUrl: string | null;
  description: string | null;
  keyFeatures: string | null;
}

export interface CreateParticipantResponse {
  participantId: string;
  consentVersion: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  condition: Condition;
  appIds: string[];
}

export interface SessionDetail {
  sessionId: string;
  condition: Condition;
  status: string;
  apps: MhealthApp[];
  completedAppIds: string[];
  skippedAppIds: string[];
  remainingCount: number;
}

export interface SusAnswers {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
  q8: number;
  q9: number;
  q10: number;
}

export interface SubmitSusResponse {
  id: string;
  appId: string;
  susScore: number;
}

export interface SavePreferencesResponse {
  id: string;
  sessionId: string;
  rankedAppIds: string[];
}

export interface CompleteSessionResponse {
  sessionId: string;
  status: string;
  completedAt: string | null;
}

export interface RankedApp {
  appId: string;
  name: string;
  marsNorm: number | null;
  susNorm: number | null;
  score: number;
  rank: number;
  lowConfidence: boolean;
  reason: string;
}

export interface RecommendationConfig {
  wMars: number;
  wSus: number;
  minSusResponses: number;
}

export interface RecommendationResult {
  config: RecommendationConfig;
  ranking: RankedApp[];
  topRecommendation: RankedApp | null;
}
