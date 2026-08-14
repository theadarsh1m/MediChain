import { useState, useEffect } from "react";
import { X, Users2, Building2, Calendar, FileText, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { useHospitalStore } from "../../store/hospitalStore";

export default function AdmitPatientModal({ isOpen, onClose, onPatientAdmitted, defaultPatientId }) {
  const { patients, fetchPatients, admitPatient, loading } = useHospitalStore();

  const [selectedPatientId, setSelectedPatientId] = useState(defaultPatientId || "");
  const [formData, setFormData] = useState({
    reason: "Emergency Inpatient Admission",
    duration: "3-5 Days Inpatient",
    department: "General Medicine",
    doctorName: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (patients.length === 0) {
        fetchPatients();
      }
      if (defaultPatientId) {
        setSelectedPatientId(defaultPatientId);
      }
    }
  }, [isOpen, patients.length, fetchPatients, defaultPatientId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toast.error("Please select a patient to admit.");
      return;
    }

    try {
      await admitPatient({
        patientId: selectedPatientId,
        reason: formData.reason,
        duration: formData.duration,
        department: formData.department,
        doctorName: formData.doctorName,
      });

      toast.success("Patient admission record logged successfully!");
      if (onPatientAdmitted) onPatientAdmitted();
      onClose();
      // Reset
      setSelectedPatientId("");
      setFormData({
        reason: "Emergency Inpatient Admission",
        duration: "3-5 Days Inpatient",
        department: "General Medicine",
        doctorName: "",
      });
    } catch (err) {
      toast.error(err.message || "Failed to record patient admission.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <Users2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Admit Patient to Facility</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record hospital inpatient stay, department, and duration.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Patient
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">-- Choose Registered Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.email || p.uid})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Admission Department / Ward
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="General Medicine">General Medicine Ward</option>
              <option value="Cardiology">Cardiology ICU / Ward</option>
              <option value="Neurology">Neurology Ward</option>
              <option value="Orthopedics">Orthopedics & Trauma</option>
              <option value="Pediatrics">Pediatrics Ward</option>
              <option value="Oncology">Oncology Day Care</option>
              <option value="Emergency Care">Emergency ICU</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Admission
            </label>
            <input
              type="text"
              name="reason"
              required
              placeholder="e.g. Post-op recovery, acute fever observation"
              value={formData.reason}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expected Duration / Bed Stay
            </label>
            <input
              type="text"
              name="duration"
              placeholder="e.g. 3 Days, 1 Week"
              value={formData.duration}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading} icon={CheckCircle2}>
              Admit Patient
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
