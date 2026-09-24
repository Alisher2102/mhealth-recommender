import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeSusScore, type SusAnswers } from "./scoring.js";

/** Build a SUS answer set from ten values in item order q1..q10. */
function answers(values: number[]): SusAnswers {
  const [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10] = values;
  return { q1, q2, q3, q4, q5, q6, q7, q8, q9, q10 } as SusAnswers;
}

describe("computeSusScore (Brooke 1986 formula, ADR-009)", () => {
  it("returns 100 for the ideal answer pattern", () => {
    // Odd items are positively worded (agree strongly = 5); even items are
    // negatively worded (disagree strongly = 1).
    assert.equal(computeSusScore(answers([5, 1, 5, 1, 5, 1, 5, 1, 5, 1])), 100);
  });

  it("returns 0 for the worst-case answer pattern", () => {
    assert.equal(computeSusScore(answers([1, 5, 1, 5, 1, 5, 1, 5, 1, 5])), 0);
  });

  it("returns 50 when every item is neutral", () => {
    assert.equal(computeSusScore(answers([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])), 50);
  });

  it("returns 50 when every item is 1, because item wording alternates", () => {
    // Guards against the intuitive-but-wrong assumption that all-1s means 0.
    // Odd items contribute 0 each; even items contribute 4 each => 20 * 2.5 = 50.
    assert.equal(computeSusScore(answers([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])), 50);
  });

  it("returns 50 when every item is 5, for the same reason", () => {
    assert.equal(computeSusScore(answers([5, 5, 5, 5, 5, 5, 5, 5, 5, 5])), 50);
  });

  it("stays within the 0..100 range across the full answer space", () => {
    // Exhaustive over a representative slice rather than all 5^10 combinations.
    for (let v = 1; v <= 5; v++) {
      for (let w = 1; w <= 5; w++) {
        const score = computeSusScore(answers([v, w, v, w, v, w, v, w, v, w]));
        assert.ok(
          score >= 0 && score <= 100,
          `score ${score} out of range for odd=${v} even=${w}`,
        );
      }
    }
  });

  it("scores in increments of 2.5", () => {
    const score = computeSusScore(answers([4, 2, 4, 2, 4, 2, 4, 3, 5, 1]));
    assert.equal((score * 10) % 25, 0, `${score} is not a multiple of 2.5`);
  });
});
