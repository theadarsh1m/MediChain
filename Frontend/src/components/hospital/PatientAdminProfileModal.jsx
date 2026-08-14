import { X, User, Phone, Mail, MapPin, ShieldAlert, Calendar, Building2, Lock, ShieldCheck, Heart } from "lucide-react";
import Button from "../ui/Button";

export default function PatientAdminProfileModal({ isOpen, onClose, patient }) {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center font-bold text-purple-700 dark:text-purple-300 text-lg border border-purple-200 dark:border-purple-800/40 overflow-hidden">
              {patient.profilePic ? (
                <img src={patient.profilePic} alt={patient.name} className="h-full w-full object-cover" />
              ) : (
                patient.name?.charAt(0) || "P"
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {patient.name}
                </h2>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                  {patient.bloodGroup || "O+"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                UID: <span className="font-mono">{patient.uid}</span> • Administrative Profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Privacy Guard Notice */}
        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/60 p-3 dark:border-blue-900/40 dark:bg-blue-950/30 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
          <Lock size={15} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Administrative Privacy Boundary:</span>
            <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mt-0.5">
              Clinical diagnostic notes and psychiatric observations are restricted to authorized treating physicians. Hospital administrators have access to demographics, appointment history, and admission records.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {/* Demographics & Contact */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Basic Demographics</h3>
            <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400">Email:</span>
                <p className="font-semibold truncate">{patient.email}</p>
              </div>
              <div>
                <span className="text-slate-400">Phone:</span>
                <p className="font-semibold">{patient.phone || "N/A"}</p>
              </div>
              <div>
                <span className="text-slate-400">Gender / Age:</span>
                <p className="font-semibold">
                  {patient.gender || "Male"} • {patient.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs` : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Assigned Doctor:</span>
                <p className="font-semibold text-blue-600 dark:text-blue-400 truncate">{patient.assignedDoctor || "Unassigned"}</p>
              </div>
            </div>

            {patient.address && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Address:</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{patient.address}</p>
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          {patient.emergencyContact && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Emergency Contact</h3>
              <div className="grid grid-cols-3 gap-2 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-400">Name:</span>
                  <p className="font-semibold">{patient.emergencyContact.name || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400">Relation:</span>
                  <p className="font-semibold">{patient.emergencyContact.relation || "Kin"}</p>
                </div>
                <div>
                  <span className="text-slate-400">Contact:</span>
                  <p className="font-semibold">{patient.emergencyContact.phone || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Inpatient Stays & Hospitalization History */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Hospital Admission & Stay Records
            </h3>
            {patient.pastHospitalizations && patient.pastHospitalizations.length > 0 ? (
              <div className="space-y-2">
                {patient.pastHospitalizations.map((stay, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{stay.hospitalName || "Hospital Ward"}</p>
                      <p className="text-slate-500 dark:text-slate-400">{stay.reason || "General Inpatient Care"}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {stay.duration || "Care Stay"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-slate-400 dark:border-slate-800">
                No past hospitalizations recorded.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
