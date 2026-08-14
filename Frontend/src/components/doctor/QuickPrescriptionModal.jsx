import { useState, useEffect } from "react";
import { X, Plus, Trash2, Pill, CheckCircle2, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { useDoctorStore } from "../../store/doctorStore";

export default function QuickPrescriptionModal({ isOpen, onClose, defaultPatient, defaultAppointmentId }) {
  const { patients, fetchPatients, issuePrescription, loading } = useDoctorStore();
  const [selectedPatientId, setSelectedPatientId] = useState(defaultPatient?._id || "");
  const [medications, setMedications] = useState([
    { name: "", dosage: "", frequency: "1-0-1 (Twice daily)", duration: "5 days", instructions: "After food" },
  ]);
  const [generalAdvice, setGeneralAdvice] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (patients.length === 0) {
        fetchPatients();
      }
      if (defaultPatient?._id) {
        setSelectedPatientId(defaultPatient._id);
      }
    }
  }, [isOpen, defaultPatient, patients.length, fetchPatients]);

  if (!isOpen) return null;

  const handleMedChange = (index, field, value) => {
    const next = [...medications];
    next[index][field] = value;
    setMedications(next);
  };

  const addMedicationRow = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "", frequency: "1-0-1 (Twice daily)", duration: "5 days", instructions: "After food" },
    ]);
  };

  const removeMedicationRow = (index) => {
    if (medications.length <= 1) {
      setMedications([{ name: "", dosage: "", frequency: "1-0-1 (Twice daily)", duration: "5 days", instructions: "After food" }]);
      return;
    }
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toast.error("Please select a patient.");
      return;
    }

    const validMeds = medications.filter((m) => m.name.trim().length > 0);
    if (validMeds.length === 0) {
      toast.error("Please specify at least one medication.");
      return;
    }

    // Build consolidated Rx string
    const medsText = validMeds
      .map((m, i) => `${i + 1}. ${m.name} (${m.dosage || "Standard dose"}) - ${m.frequency}, ${m.duration} [${m.instructions || "None"}]`)
      .join("\n");
    const fullText = `Rx Prescription:\n${medsText}${generalAdvice ? `\n\nClinical Advice: ${generalAdvice}` : ""}`;

    try {
      await issuePrescription(selectedPatientId, {
        appointmentId: defaultAppointmentId || undefined,
        medicationName: validMeds[0].name,
        dosage: validMeds[0].dosage,
        frequency: validMeds[0].frequency,
        duration: validMeds[0].duration,
        instructions: validMeds[0].instructions,
        fullPrescriptionText: fullText,
      });

      toast.success("Prescription issued & added to patient record!");
      onClose();
      // Reset
      setMedications([{ name: "", dosage: "", frequency: "1-0-1 (Twice daily)", duration: "5 days", instructions: "After food" }]);
      setGeneralAdvice("");
    } catch (err) {
      toast.error(err.message || "Failed to issue prescription.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Pill size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Write Prescription (Rx)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Create and dispatch medical prescriptions directly to patient EHR.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Select Patient
            </label>
            {defaultPatient ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <UserCheck className="text-blue-600 dark:text-emerald-400" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{defaultPatient.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{defaultPatient.email} • {defaultPatient.uid || "UID"}</p>
                </div>
              </div>
            ) : (
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.email || p.uid})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Medications Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Medications & Dosages
              </label>
              <button
                type="button"
                onClick={addMedicationRow}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                <Plus size={14} /> Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {medications.map((med, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Item #{idx + 1}</span>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicationRow(idx)}
                        className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Amoxicillin)"
                      value={med.name}
                      onChange={(e) => handleMedChange(idx, "name", e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedChange(idx, "dosage", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={med.frequency}
                      onChange={(e) => handleMedChange(idx, "frequency", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="1-0-1 (Twice daily)">1-0-1 (Twice daily)</option>
                      <option value="1-1-1 (Thrice daily)">1-1-1 (Thrice daily)</option>
                      <option value="1-0-0 (Once Morning)">1-0-0 (Once Morning)</option>
                      <option value="0-0-1 (Once Night)">0-0-1 (Once Night)</option>
                      <option value="SOS / When Needed">SOS / When Needed</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Duration (e.g. 7 days)"
                      value={med.duration}
                      onChange={(e) => handleMedChange(idx, "duration", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />

                    <input
                      type="text"
                      placeholder="Notes (e.g. After meals)"
                      value={med.instructions}
                      onChange={(e) => handleMedChange(idx, "instructions", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Advice */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Doctor's Dietary / Lifestyle Advice
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Drink plenty of water, avoid sugary drinks, rest for 3 days..."
              value={generalAdvice}
              onChange={(e) => setGeneralAdvice(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading} icon={CheckCircle2}>
              Issue Prescription
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
