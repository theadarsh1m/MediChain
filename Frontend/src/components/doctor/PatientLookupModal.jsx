import { useState, useEffect } from "react";
import { Search, X, User, FileText, Pill, ChevronRight, ShieldAlert } from "lucide-react";
import Button from "../ui/Button";
import { useDoctorStore } from "../../store/doctorStore";

export default function PatientLookupModal({ isOpen, onClose, onSelectPatientDossier, onOpenRx }) {
  const { patients, fetchPatients, loading } = useDoctorStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchPatients(searchTerm);
    }
  }, [isOpen, searchTerm, fetchPatients]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Search size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Patient EHR Lookup</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Search patient records by name, email, or UID.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              autoFocus
              placeholder="Search by patient name, email, or UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-2.5 flex-1">
          {loading && patients.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500">Searching records...</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500">
              No patient records found matching "{searchTerm}".
            </div>
          ) : (
            patients.map((pat) => (
              <div
                key={pat._id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-emerald-500/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 shrink-0 rounded-2xl bg-blue-50 dark:bg-emerald-500/10 flex items-center justify-center font-bold text-blue-700 dark:text-emerald-300 overflow-hidden border border-slate-200 dark:border-slate-700">
                    {pat.profilePic ? (
                      <img src={pat.profilePic} alt={pat.name} className="h-full w-full object-cover" />
                    ) : (
                      pat.name?.charAt(0) || "P"
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{pat.name}</p>
                      {pat.bloodGroup && (
                        <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                          {pat.bloodGroup}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {pat.email} • UID: <span className="font-mono">{pat.uid}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={FileText}
                    onClick={() => {
                      onClose();
                      onSelectPatientDossier(pat._id);
                    }}
                  >
                    View EHR
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Pill}
                    onClick={() => {
                      onClose();
                      onOpenRx(pat);
                    }}
                  >
                    Prescribe
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
