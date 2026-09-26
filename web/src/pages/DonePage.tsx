import { Link } from "react-router-dom";

export default function DonePage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-lg rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">
          Thank you — your responses have been recorded
        </h1>

        <p className="mt-4 text-slate-700">
          Your ratings help evaluate how usable mobile health apps are, and test
          a system that recommends apps based on both expert quality assessment
          and real user experience.
        </p>

        <p className="mt-4 text-sm text-slate-500">
          Your answers are stored against a random identifier and are reported
          only in aggregate. You may now close this page.
        </p>

        <Link
          to="/consent"
          className="mt-6 inline-block text-sm text-slate-500 underline"
        >
          Start a new response
        </Link>
      </div>
    </div>
  );
}
