import { useState } from "react";
import { generateAISummaryRequest } from "../../../api/patientApi";
import { toast } from "react-hot-toast";

export default function AISummaryCard({ patientData }) {
  const [summary, setSummary] = useState(patientData?.aiSummary || "");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSummary = async (forceUpdate = false) => {
    setIsGenerating(true);
    try {
      const data = await generateAISummaryRequest(forceUpdate);
      setSummary(data.summary);
      toast.success(forceUpdate ? "AI Summary updated successfully!" : "AI Summary generated!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to generate AI summary.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            AI Medical Summary
          </h2>
          <p className="text-sm text-gray-500">An intelligent overview of your medical history and current health.</p>
        </div>

        <button
          onClick={() => handleGenerateSummary(!!summary)}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : summary ? (
            <>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
               Update Summary
            </>
          ) : (
             <>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
               Generate Summary
             </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-5 min-h-[100px] border border-gray-100">
        {summary ? (
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {summary}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <p className="text-gray-400 mb-3">No AI summary generated yet.</p>
            <p className="text-sm text-gray-400">Click the button above to analyze your medical data and create a concise summary.</p>
          </div>
        )}
      </div>
    </div>
  );
}
