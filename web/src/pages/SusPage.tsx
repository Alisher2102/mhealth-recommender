import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { surveyApi } from "../api/survey";
import { ApiError } from "../api/client";
import type { SessionDetail, SusAnswers } from "../api/types";
import { SUS_ITEMS, SUS_KEYS } from "../content/sus";
import LikertScale from "../components/LikertScale";
export default function SusPage() {
  // throw new Error("test");
  const { sessionId = "" } = useParams();

  const [skipping, setSkipping] = useState(false);
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Partial<SusAnswers>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    try {
      const data = await surveyApi.getSession(sessionId);
      setSession(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load your survey.",
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  if (loading) {
    return <Centered>Loading...</Centered>;
  }
  if (!session) {
    return (
      <Centered>
        <p>{error ?? "Survey not found"}</p>
        <Link
          to="/consent"
          className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-white"
        >
          Start over
        </Link>
      </Centered>
    );
  }
  const currentApp = session.apps.find(
    (app) =>
      !session.completedAppIds.includes(app.id) &&
      !session.skippedAppIds.includes(app.id),
  );
  if (!currentApp) {
    return <Navigate to={`/survey/${sessionId}/rank`} replace />;
  }

  const handledCount =
    session.completedAppIds.length + session.skippedAppIds.length;
  const allAnswered = SUS_KEYS.every((key) => answers[key] !== undefined);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!currentApp || submitting) return;

    if (!allAnswered) {
      setError("Please answer all ten questions before continuing");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await surveyApi.submitSus(
        sessionId,
        currentApp.id,
        answers as SusAnswers,
      );
      setAnswers({});
      await loadSession();
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not save your answers",
      );
    } finally {
      setSubmitting(false);
    }
  }
  async function handleSkip() {
    if (!currentApp || submitting || skipping) return;

    setSkipping(true);
    setError(null);

    try {
      await surveyApi.skipApp(sessionId, currentApp.id);
      setAnswers({});
      await loadSession();
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not record your choice.",
      );
    } finally {
      setSkipping(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-medium text-slate-500">
          App {handledCount + 1} of {session.apps.length}
        </p>

        <div className="mt-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900">
            {currentApp.name}
          </h1>
          {currentApp.description && (
            <p className="mt-2 text-slate-700">{currentApp.description}</p>
          )}
          {currentApp.keyFeatures && (
            <p className="mt-2 text-sm text-slate-500">
              Key features: {currentApp.keyFeatures}
            </p>
          )}
          {currentApp.storeUrl ? (
            <a
              href={currentApp.storeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-medium text-blue-700 underline"
            >
              Open the app store page
            </a>
          ) : (
            <p className="mt-3 text-sm text-amber-700">
              No store link recorded for this app yet
            </p>
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <h2 className="font-medium text-slate-900">
            Please rate your experience of this app
          </h2>
          {SUS_ITEMS.map((item, index) => (
            <LikertScale
              key={item.key}
              name={`${currentApp.id}-${item.key}`}
              question={`${index + 1}. ${item.text}`}
              value={answers[item.key]}
              onChange={(value) =>
                setAnswers((prev) => ({ ...prev, [item.key]: value }))
              }
            />
          ))}
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-md bg-red-50 p-3 text-red-700"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-md bg-slate-900 px-4 py-3 font-medium text-white disabled:bg-slate-300"
          >
            {submitting ? "Saving..." : "Save and continue"}
          </button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={submitting || skipping}
            className="mt-3 w-full rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {skipping ? "Recording…" : "I would rather not rate this app"}
          </button>
        </form>
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
