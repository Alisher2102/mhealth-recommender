import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateSusInput } from "./validationSusHelper.js";

const VALID = {
  q1: 4,
  q2: 2,
  q3: 5,
  q4: 1,
  q5: 4,
  q6: 2,
  q7: 5,
  q8: 1,
  q9: 3,
  q10: 3,
};

describe("validateSusInput (ADR-007: server validation is authoritative)", () => {
  it("accepts a complete, in-range answer set", () => {
    const result = validateSusInput(VALID);
    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
    assert.equal(result.answers?.q1, 4);
  });

  it("ignores unrelated extra properties", () => {
    const result = validateSusInput({ ...VALID, appId: "abc", note: "hello" });
    assert.equal(result.ok, true);
  });

  // Regression test. The original guard read `if (error.length > 0)`, where
  // `error` was an imported `console.error` function rather than the local
  // `errors` array. A function's `.length` is its parameter count, so the
  // condition was never true and EVERY malformed body was accepted, producing
  // NaN SUS scores that were indistinguishable from real ones once stored.
  it("rejects a body missing an item instead of silently accepting it", () => {
    const { q7, ...missingOne } = VALID;
    const result = validateSusInput(missingOne);
    assert.equal(result.ok, false, "incomplete input must be rejected");
    assert.equal(result.answers, undefined);
    assert.ok(result.errors.some((e) => e.includes("q7")));
  });

  it("rejects an empty object with one error per missing item", () => {
    const result = validateSusInput({});
    assert.equal(result.ok, false);
    assert.equal(result.errors.length, 10);
  });

  it("rejects values below the 1..5 range", () => {
    const result = validateSusInput({ ...VALID, q3: 0 });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes("q3")));
  });

  it("rejects values above the 1..5 range", () => {
    const result = validateSusInput({ ...VALID, q3: 6 });
    assert.equal(result.ok, false);
  });

  it("rejects non-integer values", () => {
    const result = validateSusInput({ ...VALID, q5: 3.5 });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes("q5")));
  });

  it("rejects numeric strings, which JSON clients send easily", () => {
    const result = validateSusInput({ ...VALID, q2: "4" });
    assert.equal(result.ok, false);
  });

  it("rejects null and non-object bodies", () => {
    for (const body of [null, undefined, "x", 7, []] as unknown[]) {
      assert.equal(
        validateSusInput(body).ok,
        false,
        `expected ${JSON.stringify(body)} to be rejected`,
      );
    }
  });
});
