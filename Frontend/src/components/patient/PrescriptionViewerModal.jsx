import { X, Pill, Printer, Calendar, Stethoscope, User, FileText, CheckCircle2 } from "lucide-react";
import Button from "../ui/Button";

export default function PrescriptionViewerModal({ isOpen, onClose, prescription, consultation }) {
  if (!isOpen || (!prescription && !consultation)) return null;

  const doctorName = consultation?.doctorName || consultation?.doctor?.name || "Dr. Treating Physician";
  const specialization = consultation?.doctorSpecialization || consultation?.doctor?.specialization || "Clinical Specialist";
  const dateStr = consultation?.date
    ? new Date(consultation.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const handlePrint = () => {
    window.print();
  };

  const medicinesList = consultation?.prescriptionsList || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-emerald-500/20 dark:text-emerald-300">
              <Pill size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Medical Prescription (Rx)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Issued by {doctorName} • {specialization}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              title="Print Prescription"
            >
              <Printer size={16} />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Prescription Metadata Ribbon */}
        <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/50 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Prescription Date:</span>
            <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{dateStr}</p>
          </div>
          {consultation?.diagnosis && (
            <div className="text-right">
              <span className="text-slate-400">Clinical Diagnosis:</span>
              <p className="font-bold text-blue-700 dark:text-emerald-400 mt-0.5">{consultation.diagnosis}</p>
            </div>
          )}
        </div>

        {/* Medication Orders */}
        <div className="mt-4 space-y-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Prescribed Medications
          </h3>

          {medicinesList.length > 0 ? (
            <div className="space-y-2.5">
              {medicinesList.map((med, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-100 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {med.medicineName || med.name}
                    </p>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      {med.dosage || "500 mg"}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>Frequency: <strong className="text-slate-700 dark:text-slate-300">{med.frequency || "2x/day"}</strong></span>
                    <span>Duration: <strong className="text-slate-700 dark:text-slate-300">{med.duration || "3 days"}</strong></span>
                    {med.instructions && (
                      <span>Instructions: <strong className="text-slate-700 dark:text-slate-300">{med.instructions}</strong></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : prescription ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-mono whitespace-pre-line text-slate-800 dark:text-slate-200">
                {typeof prescription === "string" ? prescription : JSON.stringify(prescription, null, 2)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No active medication lines documented.</p>
          )}

          {/* Doctor Clinical Notes */}
          {consultation?.notes && (
            <div className="rounded-2xl bg-blue-50/40 p-3.5 dark:bg-blue-950/20 text-xs border border-blue-100 dark:border-blue-900/30">
              <span className="font-bold text-blue-900 dark:text-blue-300">Physician Notes & Advice:</span>
              <p className="text-slate-600 dark:text-slate-400 mt-1">{consultation.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-5">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
            Print Prescription
          </Button>
        </div>
      </div>
    </div>
  );
}
