import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { surveyApi } from "../api/survey";
import { ApiError } from "../api/client";
import type { Condition } from "../api/types";

const CONDITIONS: { value: Condition; label: string; blurb: string }[] = [
  {
    value: "T2DM",
    label: "Type 2 diabetes",
    blurb: "Apps for blood glucose, diet and medication tracking.",
  },
  {
    value: "HYPERTENSION",
    label: "High blood pressure",
    blurb: "Apps for blood pressure logging and heart health.",
  },
  {
    value: "COPD",
    label: "Respiratory condition (COPD or asthma)",
    blurb: "Apps for breathing exercises, symptoms and inhaler tracking.",
  },
];

export default function ConditionPage() {
  const navigate = useNavigate();
  const participantId = sessionStorage.getItem("participantId");

  const [pending, setPending] = useState<Condition | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!participantId) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-lg rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-slate-700">
            We could not find your session. Please start from the beginning.
          </p>
          <Link
            to="/consent"
            className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-white"
          >
            Start over
          </Link>
        </div>
      </div>
    );
  }

  const confirmedParticipantId: string = participantId;

  async function choose(condition: Condition) {
    if (pending) return;
    setPending(condition);
    setError(null);

    try {
      const session = await surveyApi.startSession(
        confirmedParticipantId,
        condition,
      );
      navigate(`/survey/${session.sessionId}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not start the survey. Please try again",
      );
    }
    setPending(null);
  }
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-slate-900">
          Which area would you like to review?
        </h1>
        <p className="mt-2 text-slate-600">
          Pick the area you know best. You will then be shown a few apps to try.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-md bg-red-50 p-3 text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-6 space-y-3">
          {CONDITIONS.map((condition) => (
            <button
              key={condition.value}
              type="button"
              onClick={() => choose(condition.value)}
              disabled={pending !== null}
              className="w-full rounded-xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 hover:ring-slate-400 disabled:opacity-50"
            >
              <span className="block font-medium text-slate-900">
                {condition.label}
              </span>
              <span className="mt-1 block text-sm text-slate-600">
                {condition.blurb}
              </span>
              {pending === condition.value && (
                <span className="mt-2 block text-sm text-slate-500">
                  Starting…
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
