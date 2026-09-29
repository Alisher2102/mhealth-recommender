import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { surveyApi } from "../api/survey";
import { ApiError } from "../api/client";
import type { Condition, RankedApp, RecommendationResult } from "../api/types";

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "T2DM", label: "Type 2 diabetes" },
  { value: "HYPERTENSION", label: "High blood pressure" },
  { value: "COPD", label: "Respiratory (COPD/asthma)" },
];

export default function ResultsPage() {
  const [condition, setCondition] = useState<Condition>("T2DM");
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await surveyApi.getRecommendations(condition));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load recommendations.",
      );
    } finally {
      setLoading(false);
    }
  }, [condition]);
  useEffect(() => {
    void load();
  }, [load]);

  const noConfidentApp =
    result !== null && result.ranking.every((app) => app.lowConfidence);
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-slate-900">
          App recommendations
        </h1>
        <p className="mt-2 text-slate-600">
          Apps ranked by expert quality (MARS) and user-perceived usability
          (SUS), combined with configurable weights.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCondition(c.value)}
              className={`rounded-md px-4 py-2 text-sm ${
                condition === c.value
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-slate-400"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading && <p className="mt-8 text-slate-500">Loading…</p>}

        {error && (
          <p
            role="alert"
            className="mt-8 rounded-md bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}

        {result && !loading && (
          <>
            {noConfidentApp && (
              <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5">
                <h2 className="font-semibold text-amber-900">
                  Not enough data for a recommendation yet
                </h2>
                <p className="mt-2 text-sm text-amber-800">
                  No app in this category has both an expert evaluation and
                  enough user responses. The ranking below is shown for
                  transparency, but it should not be read as a recommendation.
                </p>
              </div>
            )}

            {!noConfidentApp && result.topRecommendation && (
              <TopPick app={result.topRecommendation} />
            )}

            <h2 className="mt-10 font-medium text-slate-900">
              Full ranking ({result.ranking.length} apps)
            </h2>
            <ol className="mt-3 space-y-3">
              {result.ranking.map((app) => (
                <RankRow key={app.appId} app={app} />
              ))}
            </ol>

            <div className="mt-8 rounded-lg bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
              <p className="font-medium text-slate-900">
                How this was computed
              </p>
              <p className="mt-1">
                MARS and SUS are each normalised to a 0–1 range, then combined
                as{" "}
                <code>
                  {result.config.wMars} × MARS + {result.config.wSus} × SUS
                </code>
                . An app needs at least {result.config.minSusResponses} user
                responses to be treated as confident.
              </p>
            </div>
          </>
        )}

        <Link
          to="/consent"
          className="mt-10 inline-block text-sm text-slate-500 underline"
        >
          Take part in the survey
        </Link>
      </div>
    </div>
  );

  function TopPick({ app }: { app: RankedApp }) {
    return (
      <div className="mt-8 rounded-xl border border-slate-900 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Top recommendation
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">
          {app.name}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{app.reason}</p>
        <Scores app={app} />
      </div>
    );
  }

  function RankRow({ app }: { app: RankedApp }) {
    return (
      <li className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <span className="w-8 shrink-0 text-center text-lg font-semibold text-slate-400">
          {app.rank}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{app.name}</span>
            {app.lowConfidence && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                low confidence
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">{app.reason}</p>
          <Scores app={app} />
        </div>
      </li>
    );
  }

  /** Shows each input separately, so a missing measurement reads as absent. */
  function Scores({ app }: { app: RankedApp }) {
    return (
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-slate-500">MARS</dt>
          <dd
            className={
              app.marsNorm === null ? "text-amber-700" : "text-slate-900"
            }
          >
            {app.marsNorm === null ? "not evaluated" : app.marsNorm.toFixed(2)}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-slate-500">SUS</dt>
          <dd
            className={
              app.susNorm === null ? "text-amber-700" : "text-slate-900"
            }
          >
            {app.susNorm === null ? "no responses" : app.susNorm.toFixed(2)}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-slate-500">Score</dt>
          <dd className="font-medium text-slate-900">{app.score.toFixed(2)}</dd>
        </div>
      </dl>
    );
  }
}
