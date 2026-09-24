import { type SusAnswers } from "./scoring.js";

const SUS_KEYS: (keyof SusAnswers)[] = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "q8",
  "q9",
  "q10",
];

export interface SusValidationResult {
  ok: boolean;
  errors: string[];
  answers?: SusAnswers;
}

/**
 * Validates a raw request body as a complete set of SUS answers.
 *
 * Every one of the ten items must be present and an integer in 1..5. Partial or
 * malformed submissions are rejected outright rather than coerced, because a
 * missing answer would otherwise propagate into `computeSusScore` and yield a
 * `NaN` score that is indistinguishable from a real one once stored.
 *
 * Server-side validation is authoritative (ADR-007): the frontend form is only
 * one way to reach this endpoint.
 */
export function validateSusInput(body: unknown): SusValidationResult {
  const errors: string[] = [];
  if (typeof body !== "object" || body === null) {
    return { ok: false, errors: ["Request body must be a JSON object"] };
  }

  const record = body as Record<string, unknown>;
  const answers = {} as SusAnswers;

  for (const key of SUS_KEYS) {
    const value = record[key];
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < 1 ||
      value > 5
    ) {
      errors.push(`"${key}" must be an integer between 1 and 5`);
    } else {
      answers[key] = value;
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, errors: [], answers };
}
