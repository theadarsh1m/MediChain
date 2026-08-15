import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Clock,
  Heart,
  Pill,
  Activity,
  Calendar,
  MessageSquare,
  CheckCircle2,
  FileQuestion,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../ui/Button";
import { fetchHealthSummaryRequest } from "../../../api/ai";

export default function AIHealthSummaryCard({ onOpenBook, onOpenUpload }) {
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error" | "nodata"
  const [summaryData, setSummaryData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGenerateSummary = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const data = await fetchHealthSummaryRequest();

      if (data && data.hasSufficientData === false) {
        setSummaryData(data);
        setStatus("nodata");
        return;
      }

      setSummaryData(data);
      setStatus("success");
      toast.success("AI Health Summary generated!");
    } catch (err) {
      console.error("[AI Health Summary UI] Generation error:", err);
      const userFriendlyMsg =
        err.response?.data?.message ||
        "Unable to generate your health summary right now. Please try again.";
      setErrorMessage(userFriendlyMsg);
      setStatus("error");
    }
  };

  const summary = summaryData?.summary;
  const generatedAt = summaryData?.generatedAt
    ? new Date(summaryData.generatedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 p-6 shadow-sm dark:border-indigo-950/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 transition-all">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20">
            <Sparkles size={20} className={status === "loading" ? "animate-spin" : ""} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                AI Health Summary
              </h2>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                Powered by Gemini
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Get a simple, concise overview of your recent healthcare records.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        {status === "success" && (
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={handleGenerateSummary}
            className="text-xs self-start sm:self-center"
          >
            Regenerate Summary
          </Button>
        )}
      </div>

      {/* 1. INITIAL STATE */}
      {status === "idle" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-indigo-100/80 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Personalized Clinical Overview
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synthesize your recent vitals, active prescriptions, doctor notes, and upcoming visits into a clear, patient-friendly snapshot.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            onClick={handleGenerateSummary}
            className="text-xs shrink-0 self-start sm:self-center bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-none shadow-sm"
          >
            Generate Health Summary
          </Button>
        </div>
      )}

      {/* 2. LOADING STATE */}
      {status === "loading" && (
        <div className="space-y-4 py-4 animate-pulse">
          <div className="flex items-center gap-3 rounded-2xl bg-indigo-50/80 p-4 dark:bg-indigo-950/30 text-xs font-semibold text-indigo-800 dark:text-indigo-300">
            <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin dark:border-indigo-400" />
            <span>Analyzing your recent health records and clinical history...</span>
          </div>

          <div className="space-y-2.5">
            <div className="h-4 w-3/4 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-5/6 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 col-span-2 sm:col-span-1" />
          </div>
        </div>
      )}

      {/* 3. ERROR STATE */}
      {status === "error" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4.5 dark:border-rose-900/30 dark:bg-rose-950/20 text-xs space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900 dark:text-rose-200">
                Summary Generation Unsuccessful
              </p>
              <p className="text-rose-700/90 dark:text-rose-300/80 mt-0.5">
                {errorMessage || "Unable to generate your health summary right now. Please try again."}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGenerateSummary}
              className="text-xs text-rose-700 hover:bg-rose-100 border-rose-200 dark:text-rose-300 dark:border-rose-900/50"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* 4. NO DATA STATE */}
      {status === "nodata" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/30 dark:bg-amber-950/20 text-xs space-y-3">
          <div className="flex items-start gap-3">
            <FileQuestion size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Insufficient Health Records
              </p>
              <p className="text-amber-800/90 dark:text-amber-300/80 mt-1">
                There isn't enough medical information yet to generate a meaningful health summary. Once you attend a consultation, record vitals, or receive prescriptions, your personalized summary will appear here.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {onOpenBook && (
              <Button variant="primary" size="sm" onClick={onOpenBook} className="text-xs">
                Book Consultation
              </Button>
            )}
            {onOpenUpload && (
              <Button variant="secondary" size="sm" onClick={onOpenUpload} className="text-xs">
                Upload Diagnostic Report
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 5. SUCCESS STATE */}
      {status === "success" && summary && (
        <div className="space-y-4 pt-1">
          {/* Overall Summary Box */}
          <div className="rounded-2xl border border-indigo-100 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Overall Health Summary
              </span>
              {generatedAt && (
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock size={11} /> {generatedAt}
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              {summary.overallSummary}
            </p>
          </div>

          {/* Key Findings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Recent Clinical Health */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity size={13} className="text-blue-500" /> Recent Health & Diagnoses
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {summary.recentHealth || "No recent diagnostic changes reported."}
              </p>
            </div>

            {/* Upcoming Care */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar size={13} className="text-purple-500" /> Upcoming Care & Follow-Up
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {summary.upcomingCare || "No pending appointments scheduled."}
              </p>
            </div>
          </div>

          {/* Medications & Vitals Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Active Medications */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Pill size={13} className="text-emerald-500" /> Current Medications
              </span>
              {summary.medications?.length > 0 ? (
                <div className="space-y-1.5">
                  {summary.medications.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-2 dark:bg-slate-800/50"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">{m.name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {m.details}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No active medications documented.</p>
              )}
            </div>

            {/* Vitals Summary */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Heart size={13} className="text-rose-500" /> Recent Vitals & Trends
              </span>
              {summary.vitals?.length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {summary.vitals.map((v, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800/50 flex flex-col justify-between"
                    >
                      <span className="text-[10px] text-slate-400">{v.metric}</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{v.value}</span>
                        {v.status && (
                          <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {v.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No biometric vitals documented yet.</p>
              )}
            </div>
          </div>

          {/* Doctor Discussion Points */}
          {summary.doctorDiscussionPoints?.length > 0 && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-950/40 dark:bg-blue-950/20 text-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-blue-600 dark:text-blue-400" />
                Things to Discuss With Your Doctor
              </span>
              <ul className="space-y-1.5 pl-1">
                {summary.doctorDiscussionPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={13} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Healthcare Disclaimer */}
          <div className="rounded-xl bg-slate-100/70 p-3 text-[11px] text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 flex items-start gap-2">
            <ShieldAlert size={14} className="shrink-0 text-slate-400 mt-0.5" />
            <p>
              {summaryData.disclaimer ||
                "This AI-generated health summary is for informational purposes only and does not replace direct medical advice from your qualified physician."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
