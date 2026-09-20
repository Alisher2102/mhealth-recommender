import { type MarsItems } from "./mars.js";

const MARS_ITEM_KEYS: (keyof MarsItems)[] = [
  "a1Entertainment",
  "a2Interest",
  "a3Customisation",
  "a4Interactivity",
  "a5TargetGroup",
  "b1Performance",
  "b2EaseOfUse",
  "b3Navigation",
  "b4GesturalDesign",
  "c1Layout",
  "c2Graphics",
  "c3VisualAppeal",
  "d1Accuracy",
  "d2Goals",
  "d3QualityOfInfo",
  "d4QuantityOfInfo",
  "d5VisualInfo",
  "d6Credibility",
  "d7EvidenceBase",
  "e1WouldRecommend",
  "e2UseFrequency",
  "e3WouldPay",
  "e4OverallRating",
];

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  items?: MarsItems;
}

export function validateMarsInput(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof body !== "object" || body === null) {
    return { ok: false, errors: ["Request body must be a JSON object"] };
  }

  const record = body as Record<string, unknown>;
  const items = {} as MarsItems;

  for (const key of MARS_ITEM_KEYS) {
    const value = record[key];
    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < 1 ||
      value > 5
    ) {
      errors.push(`"${key}" must be an integer between 1 and 5`);
    } else {
      items[key] = value;
    }
  }
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, errors: [], items };
}
