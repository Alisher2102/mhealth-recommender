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

export function computeSusScore(a: SusAnswers): number {
  const odd = [a.q1, a.q3, a.q5, a.q7, a.q9];
  const even = [a.q2, a.q4, a.q6, a.q8, a.q10];

  const oddContribution = odd.reduce((sum, v) => sum + (v - 1), 0);
  const evenContribution = even.reduce((sum, v) => sum + (5 - v), 0);

  const score = (oddContribution + evenContribution) * 2.5;
  return Math.round(score * 100) / 100;
}
