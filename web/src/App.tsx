import { Navigate, Route, Routes } from "react-router-dom";
import ConsentPage from "./pages/ConsentPage";
import ConditionPage from "./pages/ConditionPage";
import SusPage from "./pages/SusPage";
import RankingPage from "./pages/RankingPage";
import DonePage from "./pages/DonePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/consent" replace />} />
      <Route path="/consent" element={<ConsentPage />} />
      <Route path="/condition" element={<ConditionPage />} />
      <Route path="/survey/:sessionId" element={<SusPage />} />
      <Route path="/survey/:sessionId/rank" element={<RankingPage />} />
      <Route path="/done" element={<DonePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 p-10 text-center text-slate-600">
      Page not found.
    </div>
  );
}
