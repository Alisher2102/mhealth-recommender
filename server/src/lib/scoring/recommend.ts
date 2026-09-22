export interface AppScoreInput {
  appId: string;
  name: string;
  marsTotal: number | null;
  susMean: number | null;
  susCount: number;
}

export interface RecommendationConfig {
  wMars: number;
  wSus: number;
  minSusResponses: number;
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

export interface RecommendationResult {
  config: RecommendationConfig;
  ranking: RankedApp[];
  topRecommendation: RankedApp | null;
}

export function normaliseMars(marsTotal: number | null): number | null {
  if (marsTotal === null) return null;
  return (marsTotal - 1) / 4;
}

export function normaliseSus(susMean: number | null): number | null {
  if (susMean === null) return null;
  return susMean / 100;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function rankApps(
  apps: AppScoreInput[],
  config: RecommendationConfig,
): RecommendationResult {
  const scored = apps.map((app) => {
    const marsNorm = normaliseMars(app.marsTotal);
    const susNorm = normaliseSus(app.susMean);

    const score = config.wMars * (marsNorm ?? 0) + config.wSus * (susNorm ?? 0);
    const lowConfidence =
      app.susCount < config.minSusResponses ||
      marsNorm === null ||
      susNorm === null;
    const reasonParts: string[] = [];
    if (marsNorm === null) reasonParts.push("no MARS evaluation");
    if (susNorm === null) reasonParts.push("No SUS evaluation");
    else if (app.susCount < config.minSusResponses)
      reasonParts.push(`only ${app.susCount} SUS response(s)`);

    const reason =
      reasonParts.length > 0
        ? `Low confidence: ${reasonParts.join(", ")}.`
        : `MARS ${app.marsTotal}/5 and mean SUS ${app.susMean}/100 combined with weights` +
          `${config.wMars}/${config.wSus}.`;
    return {
      appId: app.appId,
      name: app.name,
      marsNorm: marsNorm === null ? null : round2(marsNorm),
      susNorm: susNorm === null ? null : round2(susNorm),
      score: round2(score),
      rank: 0,
      lowConfidence,
      reason,
    };
  });
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;

    const aMars = a.marsNorm ?? -1;
    const bMars = b.marsNorm ?? -1;
    if (bMars !== aMars) return bMars - aMars;

    return a.name.localeCompare(b.name);
  });
  scored.forEach((app, i) => {
    app.rank = i + 1;
  });

  const topConfident = scored.find((a) => !a.lowConfidence);
  const topRecommendation = topConfident ?? scored[0] ?? null;
  return { config, ranking: scored, topRecommendation };
}
