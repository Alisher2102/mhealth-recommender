import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { surveyApi } from "../api/survey";
import { ApiError } from "../api/client";
import type { MhealthApp, SessionDetail } from "../api/types";
import { flushSync } from "react-dom";

export default function RankingPage() {
  const { sessionId = "" } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [ordered, setOrdered] = useState<MhealthApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await surveyApi.getSession(sessionId);
      setSession(data);
      setOrdered(data.apps);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load your survey.",
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;

    const applySwap = () =>
      flushSync(() => {
        setOrdered((prev) => {
          const next = [...prev];
          [next[index], next[target]] = [next[target], next[index]];
          return next;
        });
      });

    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => unknown;
    };

    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(applySwap);
    } else {
      applySwap();
    }
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      await surveyApi.savePreferences(
        sessionId,
        ordered.map((app) => app.id),
      );
      await surveyApi.completeSession(sessionId);
      sessionStorage.removeItem("participantId");
      navigate("/done", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not save your ranking.",
      );
      setSubmitting(false);
    }
  }

  if (loading) return <Centered>Loading…</Centered>;

  if (!session) {
    return (
      <Centered>
        <p>{error ?? "Survey not found."}</p>
        <Link
          to="/consent"
          className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-white"
        >
          Start over
        </Link>
      </Centered>
    );
  }

  // Someone reached this URL before rating every app -- send them back.
  if (session.remainingCount > 0) {
    return <Navigate to={`/survey/${sessionId}`} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-slate-900">
          Last step: put the apps in your order of preference
        </h1>
        <p className="mt-2 text-slate-600">
          Place the app you would most recommend at the top. Use the arrows to
          move each app up or down.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-md bg-red-50 p-3 text-red-700"
          >
            {error}
          </p>
        )}

        <ol className="mt-6 space-y-3">
          {ordered.map((app, index) => (
            <li
              key={app.id}
              style={
                { viewTransitionName: `rank-${app.id}` } as React.CSSProperties
              }
              className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <span className="w-8 shrink-0 text-center text-lg font-semibold text-slate-400">
                {index + 1}
              </span>

              <span className="flex-1 font-medium text-slate-900">
                {app.name}
              </span>

              <span className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || submitting}
                  aria-label={`Move ${app.name} up`}
                  className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === ordered.length - 1 || submitting}
                  aria-label={`Move ${app.name} down`}
                  className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 disabled:opacity-30"
                >
                  ↓
                </button>
              </span>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-8 w-full rounded-md bg-slate-900 px-4 py-3 font-medium text-white disabled:bg-slate-300"
        >
          {submitting ? "Finishing…" : "Finish the survey"}
        </button>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-lg rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        {children}
      </div>
    </div>
  );
}
