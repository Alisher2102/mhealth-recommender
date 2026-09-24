import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeMarsScores, type MarsItems } from "./mars.js";

const OBJECTIVE_KEYS = [
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
] as const;

const SUBJECTIVE_KEYS = [
  "e1WouldRecommend",
  "e2UseFrequency",
  "e3WouldPay",
  "e4OverallRating",
] as const;

/** Every one of the 23 items set to the same value. */
function uniform(value: number): MarsItems {
  const items = {} as MarsItems;
  for (const key of [...OBJECTIVE_KEYS, ...SUBJECTIVE_KEYS]) {
    items[key] = value;
  }
  return items;
}

/** Set subscales independently: A (5 items), B (4), C (3), D (7), E (4). */
function bySubscale(a: number[], b: number[], c: number[], d: number[], e: number[]): MarsItems {
  return {
    a1Entertainment: a[0],
    a2Interest: a[1],
    a3Customisation: a[2],
    a4Interactivity: a[3],
    a5TargetGroup: a[4],
    b1Performance: b[0],
    b2EaseOfUse: b[1],
    b3Navigation: b[2],
    b4GesturalDesign: b[3],
    c1Layout: c[0],
    c2Graphics: c[1],
    c3VisualAppeal: c[2],
    d1Accuracy: d[0],
    d2Goals: d[1],
    d3QualityOfInfo: d[2],
    d4QuantityOfInfo: d[3],
    d5VisualInfo: d[4],
    d6Credibility: d[5],
    d7EvidenceBase: d[6],
    e1WouldRecommend: e[0],
    e2UseFrequency: e[1],
    e3WouldPay: e[2],
    e4OverallRating: e[3],
  };
}

describe("computeMarsScores — bounds", () => {
  it("returns the minimum of 1 when all items are 1", () => {
    const s = computeMarsScores(uniform(1));
    assert.equal(s.marsTotal, 1);
    assert.equal(s.engagementMean, 1);
    assert.equal(s.informationMean, 1);
  });

  it("returns the maximum of 5 when all items are 5", () => {
    const s = computeMarsScores(uniform(5));
    assert.equal(s.marsTotal, 5);
  });

  it("keeps the total within the 1..5 instrument range", () => {
    for (let v = 1; v <= 5; v++) {
      const s = computeMarsScores(uniform(v));
      assert.ok(s.marsTotal >= 1 && s.marsTotal <= 5);
      assert.equal(s.marsTotal, v);
    }
  });
});

describe("computeMarsScores — subscale means", () => {
  it("averages each subscale over its own item count, not the whole set", () => {
    // Aesthetics has only 3 items, so 5,5,2 => 4. Engagement has 5 items.
    const s = computeMarsScores(
      bySubscale([1, 2, 3, 4, 5], [2, 2, 4, 4], [5, 5, 2], [1, 1, 1, 1, 1, 1, 1], [3, 3, 3, 3]),
    );
    assert.equal(s.engagementMean, 3); // 15 / 5
    assert.equal(s.functionalityMean, 3); // 12 / 4
    assert.equal(s.aestheticsMean, 4); // 12 / 3
    assert.equal(s.informationMean, 1); // 7 / 7
  });
});

describe("computeMarsScores — Section E is excluded from the objective total (ADR-004)", () => {
  it("does not change marsTotal when only Section E changes", () => {
    const base = bySubscale(
      [4, 4, 3, 3, 4],
      [4, 5, 4, 3],
      [4, 4, 5],
      [3, 4, 4, 3, 4, 5, 4],
      [1, 1, 1, 1],
    );
    const withHighE = { ...base, e1WouldRecommend: 5, e2UseFrequency: 5, e3WouldPay: 5, e4OverallRating: 5 };

    const low = computeMarsScores(base);
    const high = computeMarsScores(withHighE);

    assert.equal(
      low.marsTotal,
      high.marsTotal,
      "Section E must not influence the objective total",
    );
    assert.equal(low.subjectiveMean, 1);
    assert.equal(high.subjectiveMean, 5);
  });

  it("still reports the subjective mean for the discussion chapter", () => {
    const s = computeMarsScores(
      bySubscale([3, 3, 3, 3, 3], [3, 3, 3, 3], [3, 3, 3], [3, 3, 3, 3, 3, 3, 3], [5, 4, 2, 1]),
    );
    assert.equal(s.subjectiveMean, 3); // (5+4+2+1)/4
  });
});

describe("computeMarsScores — average-then-round precision (ADR-008)", () => {
  it("computes the total from UNROUNDED subscale means", () => {
    // This input is deliberately chosen so that the two candidate
    // implementations give DIFFERENT answers, otherwise the test would pass
    // either way and prove nothing:
    //
    //   subscale means      A=3.0  B=3.0  C=10/3=3.333...  D=23/7=3.2857...
    //   average-then-round  -> 3.15   (ADR-008, correct)
    //   round-then-average  -> 3.16   (incorrect: (3.0+3.0+3.33+3.29)/4 = 3.155)
    const items = bySubscale(
      [3, 3, 3, 3, 3], //       15 / 5 = 3.0
      [3, 3, 3, 3], //          12 / 4 = 3.0
      [4, 3, 3], //             10 / 3 = 3.333...
      [4, 3, 3, 3, 3, 4, 3], // 23 / 7 = 3.2857142857...
      [3, 3, 3, 3],
    );
    const s = computeMarsScores(items);

    // Expected value derived from first principles at full precision.
    const expected =
      Math.round(((15 / 5 + 12 / 4 + 10 / 3 + 23 / 7) / 4) * 100) / 100;
    assert.equal(expected, 3.15, "sanity check on the expected value itself");
    assert.equal(s.marsTotal, expected);

    // Guard the specific regression: rounding the subscale means first would
    // yield 3.16 here.
    assert.notEqual(
      s.marsTotal,
      3.16,
      "total appears to have been computed from pre-rounded subscale means",
    );

    // Subscale means are rounded for presentation only.
    assert.equal(s.aestheticsMean, 3.33);
    assert.equal(s.informationMean, 3.29);
  });

  it("rounds every reported value to at most 2 decimal places", () => {
    const s = computeMarsScores(
      bySubscale([1, 2, 3, 4, 5], [1, 2, 3, 5], [1, 2, 5], [1, 2, 3, 4, 5, 5, 2], [1, 2, 3, 4]),
    );
    for (const [key, value] of Object.entries(s)) {
      assert.equal(
        Math.round(value * 100) / 100,
        value,
        `${key} has more than 2 decimal places: ${value}`,
      );
    }
  });
});
