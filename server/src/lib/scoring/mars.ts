//MARS (Mobile Application Rating Scale) scoring

export interface MarsItems {
  // A. Engagement (5)
  a1Entertainment: number;
  a2Interest: number;
  a3Customisation: number;
  a4Interactivity: number;
  a5TargetGroup: number;
  // B. Functionality (4)
  b1Performance: number;
  b2EaseOfUse: number;
  b3Navigation: number;
  b4GesturalDesign: number;
  // C. Aesthetics (3)
  c1Layout: number;
  c2Graphics: number;
  c3VisualAppeal: number;
  // D. Information (7)
  d1Accuracy: number;
  d2Goals: number;
  d3QualityOfInfo: number;
  d4QuantityOfInfo: number;
  d5VisualInfo: number;
  d6Credibility: number;
  d7EvidenceBase: number;
  // E. Subjective (4) — excluded from the objective total
  e1WouldRecommend: number;
  e2UseFrequency: number;
  e3WouldPay: number;
  e4OverallRating: number;
}

export interface MarsScores {
  engagementMean: number;
  functionalityMean: number;
  aestheticsMean: number;
  informationMean: number;
  subjectiveMean: number;
  marsTotal: number;
}

/** Average a list of numbers, rounded to 2 decimal places. */
function mean(values: number[]): number {
  const sum = values.reduce((acc, v) => acc + v, 0);
  const avg = sum / values.length;
  return Math.round(avg * 100) / 100;
}

/**
 * Compute the MARS subscale means, subjective mean, and overall total.
 * The overall total is the mean of the four OBJECTIVE subscale means only.
 */
export function computeMarsScores(items: MarsItems): MarsScores {
  const engagementMean = mean([
    items.a1Entertainment,
    items.a2Interest,
    items.a3Customisation,
    items.a4Interactivity,
    items.a5TargetGroup,
  ]);

  const functionalityMean = mean([
    items.b1Performance,
    items.b2EaseOfUse,
    items.b3Navigation,
    items.b4GesturalDesign,
  ]);

  const aestheticsMean = mean([
    items.c1Layout,
    items.c2Graphics,
    items.c3VisualAppeal,
  ]);

  const informationMean = mean([
    items.d1Accuracy,
    items.d2Goals,
    items.d3QualityOfInfo,
    items.d4QuantityOfInfo,
    items.d5VisualInfo,
    items.d6Credibility,
    items.d7EvidenceBase,
  ]);

  const subjectiveMean = mean([
    items.e1WouldRecommend,
    items.e2UseFrequency,
    items.e3WouldPay,
    items.e4OverallRating,
  ]);

  // Objective total = mean of the four objective subscale means.
  const marsTotal = mean([
    engagementMean,
    functionalityMean,
    aestheticsMean,
    informationMean,
  ]);

  return {
    engagementMean,
    functionalityMean,
    aestheticsMean,
    informationMean,
    subjectiveMean,
    marsTotal,
  };
}
