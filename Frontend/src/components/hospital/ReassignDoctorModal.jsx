import { useState, useEffect } from "react";
import { X, UserCheck, Stethoscope, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { useHospitalStore } from "../../store/hospitalStore";

export default function ReassignDoctorModal({ isOpen, onClose, appointment }) {
  const { doctors, fetchDoctors, reassignAppointment, loading } = useHospitalStore();
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  useEffect(() => {
    if (isOpen && doctors.length === 0) {
      fetchDoctors();
    }
    if (appointment?.doctor?._id) {
      setSelectedDoctorId(appointment.doctor._id);
    }
  }, [isOpen, appointment, doctors.length, fetchDoctors]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      toast.error("Please select a doctor to assign.");
      return;
    }

    try {
      await reassignAppointment(appointment._id, selectedDoctorId);
      toast.success("Appointment reassigned successfully.");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to reassign appointment.");
    }
  };

  const activeDoctors = doctors.filter((d) => d.status === "Active" || !d.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Reassign Doctor
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient: <span className="font-semibold text-slate-800 dark:text-slate-200">{appointment.patient?.name}</span> • Time: {appointment.appointmentTime}
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Select Physician / Specialist
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto p-1">
              {activeDoctors.map((doc) => {
                const isSelected = selectedDoctorId === doc._id;
                return (
                  <button
                    key={doc._id}
                    type="button"
                    onClick={() => setSelectedDoctorId(doc._id)}
                    className={`w-full rounded-2xl border p-3 text-left text-xs transition flex items-center justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-100 shadow-sm"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div>
                      <p className="font-bold">Dr. {doc.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {doc.department || doc.specialization || "General Medicine"} • {doc.appointmentsTodayCount || 0} visits today
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={loading}>
              Reassign Appointment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
