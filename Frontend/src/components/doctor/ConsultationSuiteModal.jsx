import { useState, useEffect } from "react";
import {
  X,
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Scale,
  Pill,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Upload,
  CheckCircle2,
  Printer,
  AlertTriangle,
  FileDown,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { useDoctorStore } from "../../store/doctorStore";
import { uploadToCloudinary } from "../../utils/cloudinary";

export default function ConsultationSuiteModal({
  isOpen,
  onClose,
  appointment,
  patient,
  onConsultationCompleted,
}) {
  const { completeConsultation, loading } = useDoctorStore();

  const activePatient = patient || appointment?.patient;
  const appointmentId = appointment?._id;

  const [symptoms, setSymptoms] = useState("");
  const [vitals, setVitals] = useState({
    bloodPressure: "120/80",
    heartRate: "72",
    temperature: "98.6",
    weight: "65",
    spO2: "98",
  });
  const [diagnosis, setDiagnosis] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [medicines, setMedicines] = useState([
    {
      medicineName: "Paracetamol",
      dosage: "500 mg",
      frequency: "2 times/day",
      duration: "3 days",
      instructions: "After food",
    },
  ]);
  const [followUpDate, setFollowUpDate] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (appointment) {
      if (appointment.reason) setSymptoms(appointment.reason);
      if (appointment.diagnosis) setDiagnosis(appointment.diagnosis);
      if (appointment.notes) setDoctorNotes(appointment.notes);
      if (appointment.vitals) setVitals((prev) => ({ ...prev, ...appointment.vitals }));
      if (appointment.prescriptionsList && appointment.prescriptionsList.length > 0) {
        setMedicines(appointment.prescriptionsList);
      }
    }
  }, [appointment]);

  if (!isOpen || !activePatient) return null;

  const handleVitalChange = (field, value) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        medicineName: "",
        dosage: "500 mg",
        frequency: "Once daily",
        duration: "5 days",
        instructions: "After meals",
      },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) {
      toast.error("At least one medicine item is recommended.");
      return;
    }
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const url = await uploadToCloudinary(file);
      setAttachments((prev) => [...prev, url]);
      toast.success("Medical report uploaded and attached!");
    } catch (err) {
      toast.error(err.message || "Failed to upload medical report.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error("Please provide a clinical diagnosis.");
      return;
    }

    try {
      await completeConsultation({
        appointmentId,
        patientId: activePatient._id,
        symptoms,
        vitals,
        diagnosis,
        notes: doctorNotes,
        prescriptionsList: medicines.filter((m) => m.medicineName.trim()),
        followUpDate,
        attachments,
      });

      toast.success("Consultation completed and saved to EHR successfully!");
      if (onConsultationCompleted) onConsultationCompleted();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to complete consultation.");
    }
  };

  const handlePrintRx = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold">
              <Stethoscope size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Active Clinical Consultation
                </h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 animate-pulse">
                  Live Session
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient: <span className="font-semibold text-slate-800 dark:text-slate-200">{activePatient.name}</span> • UID: <span className="font-mono">{activePatient.uid}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handlePrintRx} icon={Printer} type="button">
              Print Rx
            </Button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Patient Clinical Info Ribbon */}
        <div className="bg-blue-50/60 dark:bg-blue-950/20 px-6 py-3 border-b border-blue-100 dark:border-blue-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400">Blood Group:</span>{" "}
              <span className="font-bold text-rose-600 dark:text-rose-400">{activePatient.bloodGroup || "O+"}</span>
            </div>
            <div>
              <span className="text-slate-400">Gender / Age:</span>{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {activePatient.gender || "Male"} • {activePatient.dob ? `${new Date().getFullYear() - new Date(activePatient.dob).getFullYear()} yrs` : "32 yrs"}
              </span>
            </div>
          </div>

          {activePatient.medicalHistory?.allergies?.length > 0 && (
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
              <AlertTriangle size={14} />
              <span>Allergies: {activePatient.medicalHistory.allergies.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Main Consultation Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Symptoms */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              1. Chief Symptoms & Patient Complaints
            </label>
            <textarea
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Acute sore throat, fever for 3 days, dry cough, mild headache..."
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Vitals Matrix */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              2. Patient Vitals Matrix
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-1">
                  <Activity size={13} className="text-blue-500" /> BP (mmHg)
                </div>
                <input
                  type="text"
                  value={vitals.bloodPressure}
                  onChange={(e) => handleVitalChange("bloodPressure", e.target.value)}
                  placeholder="120/80"
                  className="w-full font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-1">
                  <Heart size={13} className="text-rose-500" /> Heart (bpm)
                </div>
                <input
                  type="text"
                  value={vitals.heartRate}
                  onChange={(e) => handleVitalChange("heartRate", e.target.value)}
                  placeholder="72"
                  className="w-full font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-1">
                  <Thermometer size={13} className="text-amber-500" /> Temp (°F)
                </div>
                <input
                  type="text"
                  value={vitals.temperature}
                  onChange={(e) => handleVitalChange("temperature", e.target.value)}
                  placeholder="98.6"
                  className="w-full font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-1">
                  <Scale size={13} className="text-emerald-500" /> Weight (kg)
                </div>
                <input
                  type="text"
                  value={vitals.weight}
                  onChange={(e) => handleVitalChange("weight", e.target.value)}
                  placeholder="65"
                  className="w-full font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/60 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-1">
                  <Activity size={13} className="text-purple-500" /> SpO2 (%)
                </div>
                <input
                  type="text"
                  value={vitals.spO2}
                  onChange={(e) => handleVitalChange("spO2", e.target.value)}
                  placeholder="98"
                  className="w-full font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Clinical Diagnosis & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                3. Clinical Diagnosis *
              </label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Viral Pharyngitis / Seasonal Rhinitis"
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              4. Clinical Observations & Doctor Notes
            </label>
            <textarea
              rows={2}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Clinical evaluation findings, lifestyle recommendations, hydration instructions, etc..."
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Prescription Multi-Item Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                5. Prescription & Medication Orders
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={handleAddMedicine}
                className="text-[11px] py-1 px-2.5"
              >
                Add Medicine
              </Button>
            </div>

            <div className="space-y-2.5">
              {medicines.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/40 items-center"
                >
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Paracetamol)"
                      value={item.medicineName}
                      onChange={(e) => handleMedicineChange(idx, "medicineName", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500 mg)"
                      value={item.dosage}
                      onChange={(e) => handleMedicineChange(idx, "dosage", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Frequency (e.g. 2 times/day)"
                      value={item.frequency}
                      onChange={(e) => handleMedicineChange(idx, "frequency", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Duration (e.g. 3 days)"
                      value={item.duration}
                      onChange={(e) => handleMedicineChange(idx, "duration", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Instructions (e.g. After food)"
                      value={item.instructions}
                      onChange={(e) => handleMedicineChange(idx, "instructions", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Reports Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              6. Medical Reports & Diagnostic Files (Optional)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60 cursor-pointer transition">
                <Upload size={15} />
                <span>{uploadingFile ? "Uploading..." : "Attach Report / Scan"}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
              </label>

              {attachments.map((att, i) => (
                <a
                  key={i}
                  href={att}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  <FileText size={13} /> Report #{i + 1}
                </a>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading} icon={CheckCircle2}>
              Complete Consultation & Write to EHR
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
