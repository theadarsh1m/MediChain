import { useState, useEffect } from "react";
import { X, Building2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { useHospitalStore } from "../../store/hospitalStore";

const DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "ENT",
  "Dermatology",
  "General Medicine",
  "Emergency Care",
  "Oncology",
  "Radiology",
];

export default function AssignDepartmentModal({ isOpen, onClose, doctor }) {
  const { assignDoctorDepartment, loading } = useHospitalStore();
  const [selectedDept, setSelectedDept] = useState("");

  useEffect(() => {
    if (doctor) {
      setSelectedDept(doctor.department || doctor.specialization || "General Medicine");
    }
  }, [doctor]);

  if (!isOpen || !doctor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDept) {
      toast.error("Please select a department");
      return;
    }

    try {
      await assignDoctorDepartment(doctor._id, selectedDept);
      toast.success(`Dr. ${doctor.name} assigned to ${selectedDept} department.`);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to assign department.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Assign Department
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dr. {doctor.name} • UID: <span className="font-mono">{doctor.uid}</span>
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
              Select Specialty / Clinical Wing
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {DEPARTMENTS.map((dept) => {
                const isSelected = selectedDept === dept;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`rounded-2xl border p-3 text-left text-xs font-bold transition flex items-center justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300 shadow-sm"
                        : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300"
                    }`}
                  >
                    <span>{dept}</span>
                    {isSelected && <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={loading}>
              Save Assignment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
