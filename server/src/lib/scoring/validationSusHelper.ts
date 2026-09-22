import { error } from "console";
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
      errors.push(`"${key}"must be an integer between 1 and 5`);
    } else {
      answers[key] = value;
    }
  }
  if (error.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, errors: [], answers };
}
