import { X, Stethoscope, Building2, Award, DollarSign, Calendar, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function DoctorDetailModal({ isOpen, onClose, doctor }) {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-emerald-500/20 flex items-center justify-center font-bold text-blue-700 dark:text-emerald-300 text-lg border border-blue-200 dark:border-emerald-500/30 overflow-hidden">
              {doctor.profilePic ? (
                <img src={doctor.profilePic} alt={doctor.name} className="h-full w-full object-cover" />
              ) : (
                doctor.name?.charAt(0) || "D"
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Dr. {doctor.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {doctor.specialization || doctor.department || "Clinical Specialist"}
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

        <div className="mt-4 space-y-3 text-xs">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Hospital:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{doctor.hospital || "MediVault Clinical Center"}</span>
            </div>
            {doctor.experience && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Experience:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{doctor.experience} years</span>
              </div>
            )}
            {doctor.consultationFee && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">${doctor.consultationFee}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Link to={`/patient/appointments/book?doctor=${doctor._id || ""}`}>
            <Button variant="primary" size="sm" icon={Calendar}>
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
