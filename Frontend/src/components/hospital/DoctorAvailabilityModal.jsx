import { X, Clock, Calendar, ShieldCheck, Mail, Award, DollarSign, Activity } from "lucide-react";
import Button from "../ui/Button";

export default function DoctorAvailabilityModal({ isOpen, onClose, doctor }) {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all max-h-[90vh] overflow-y-auto">
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
                {doctor.department || doctor.specialization} • License: <span className="font-mono">{doctor.licenseNumber || "MED-881"}</span>
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

        <div className="mt-4 space-y-4 text-xs">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-slate-400">Status</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{doctor.status || "Active"}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-slate-400">Appointments Today</span>
              <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{doctor.appointmentsTodayCount || 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-slate-400">Total Patients</span>
              <p className="font-bold text-purple-600 dark:text-purple-400 mt-0.5">{doctor.totalPatients || 0}</p>
            </div>
          </div>

          {/* Credentials */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-3.5 dark:border-slate-800 dark:bg-slate-800/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{doctor.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Experience:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{doctor.experience || 5} years</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Consultation Fee:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">${doctor.consultationFee || 50}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Telemedicine Allowed:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{doctor.allowTelemedicine ? "Yes (Online)" : "In-Person Only"}</span>
            </div>
          </div>

          {/* Clinic Hours & Schedule */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Weekly Clinic Hours & Availability
            </h3>
            {doctor.clinicHours && doctor.clinicHours.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {doctor.clinicHours.map((slot, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 bg-white p-2 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{slot.day}</span>
                    <span className="text-slate-500 font-mono">{slot.startTime} - {slot.endTime}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 text-slate-500 flex items-center gap-2">
                <Clock size={14} className="text-blue-500" />
                <span>Standard OPD Hours: Mon - Sat (09:00 AM - 05:00 PM)</span>
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
