import { api } from "./client";
import type {
  CompleteSessionResponse,
  Condition,
  CreateParticipantResponse,
  CreateSessionResponse,
  SavePreferencesResponse,
  SessionDetail,
  SubmitSusResponse,
  SusAnswers,
} from "./types";

export const surveyApi = {
  createParticipant: (input: {
    ageBand?: string;
    gender?: string;
    hasChronicCondition?: boolean;
  }) =>
    api.post<CreateParticipantResponse>("/api/participants", {
      consentGiven: true,
      ...input,
    }),
  startSession: (participantId: string, condition: Condition) =>
    api.post<CreateSessionResponse>("/api/survey/sessions", {
      participantId,
      condition,
    }),
  getSession: (sessionId: string) =>
    api.get<SessionDetail>(`/api/survey/sessions/${sessionId}`),
  submitSus: (sessionId: string, appId: string, answers: SusAnswers) =>
    api.post<SubmitSusResponse>(`/api/survey/sessions/${sessionId}/sus`, {
      appId,
      ...answers,
    }),
  savePreferences: (sessionId: string, rankedAppIds: string[]) =>
    api.post<SavePreferencesResponse>(
      `/api/survey/sessions/${sessionId}/preferences`,
      { rankedAppIds },
    ),
  completeSession: (sessionId: string) =>
    api.patch<CompleteSessionResponse>(
      `/api/survey/sessions/${sessionId}/complete`,
    ),
  skipApp: (sessionId: string, appId: string) =>
    api.post<{ sessionId: string; skippedAppIds: string[] }>(
      `/api/survey/sessions/${sessionId}/skip`,
      { appId },
    ),
};
