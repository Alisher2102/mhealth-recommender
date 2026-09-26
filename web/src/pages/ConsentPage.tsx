import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { surveyApi } from "../api/survey";
import { ApiError } from "../api/client";
import { consentContent } from "../content/consent";

const AGE_BANDS = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

export default function ConsentPage() {
  const navigate = useNavigate();

  const [agreed, setAgreed] = useState(false);
  const [ageBand, setAgeBand] = useState("");
  const [hasChronicalCondition, setHasChronicalCondition] =
    useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!agreed || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await surveyApi.createParticipant({
        ageBand: ageBand || undefined,
        hasChronicCondition:
          hasChronicalCondition === ""
            ? undefined
            : hasChronicalCondition === "yes",
      });
      sessionStorage.setItem("participantId", result.participantId);
      navigate("/condition");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again",
      );
    }
    setSubmitting(false);
  }
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <h1 className="text-2xl font-semibold text-slate-900">
          {consentContent.title}
        </h1>
        <p className="mt-4 text-slate-700">{consentContent.purpose}</p>
        <Section
          title="What taking part involves"
          items={consentContent.whatIsInvolved}
        />
        <Section title="Your rights" items={consentContent.yourRights} />
        <Section
          title="How your data is handled"
          items={consentContent.dataHandling}
        />

        <p className="mt-6 text-sm text-slate-500">{consentContent.contact}</p>

        <hr className="my-8 border-slate-200" />

        <p className="text-sm font-medium text-slate-700">
          The two questions below are optional.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-700">Age group</span>
            <select
              value={ageBand}
              onChange={(e) => setAgeBand(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 p-2"
            >
              <option value="">Prefer not to say</option>
              {AGE_BANDS.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-slate-700">
              Do you manage a long-term health condition?
            </span>
            <select
              value={hasChronicalCondition}
              onChange={(e) => setHasChronicalCondition(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 p-2"
            >
              <option value="">Prefer not to say</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>
        <label className="mt-8 flex items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span className="text-slate-900">
            {consentContent.agreementLabel}
          </span>
        </label>

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
          disabled={!agreed || submitting}
          className="mt-6 w-full rounded-md bg-slate-900 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {submitting ? "Starting…" : "I agree — begin"}
        </button>
      </form>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-6">
      <h2 className="font-medium text-slate-900">{title}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
