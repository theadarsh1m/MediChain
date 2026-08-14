import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CheckCircle,
  ClipboardList,
  Edit3,
  XCircle,
  Pill,
  Plus,
  Trash2,
  FileText,
  Upload,
  User,
  HeartPulse,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  ExternalLink,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import PageHeader from "../../components/ui/PageHeader";
import Section from "../../components/ui/Section";
import PatientDossierModal from "../../components/doctor/PatientDossierModal";
import { useAppointmentStore } from "../../store/appointmentStore";
import { useDoctorStore } from "../../store/doctorStore";

export default function AppointmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentAppointment, fetchAppointmentById, updateStatus, updateNotes, loading } = useAppointmentStore();
  const { uploadToPatient, issuePrescription } = useDoctorStore();

  const [dossierOpen, setDossierOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [consultationData, setConsultationData] = useState({
    diagnosis: "",
    notes: "",
    advice: "",
    prescription: "",
  });

  const [medications, setMedications] = useState([
    { name: "", dosage: "", frequency: "1-0-1 (Twice daily)", duration: "5 days", instructions: "After food" },
  ]);

  useEffect(() => {
    fetchAppointmentById(id);
  }, [id, fetchAppointmentById]);

  useEffect(() => {
    if (currentAppointment) {
      setConsultationData({
        diagnosis: currentAppointment.diagnosis || "",
        notes: currentAppointment.notes || "",
        advice: "",
        prescription: currentAppointment.prescription || "",
      });
    }
  }, [currentAppointment]);

  const handleConsultationChange = (e) => {
    setConsultationData({ ...consultationData, [e.target.name]: e.target.value });
  };

  const handleMedChange = (index, field, value) => {
    const next = [...medications];
    next[index][field] = value;
    setMedications(next);
  };

  const addMedRow = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "", frequency: "1-0-1 (Twice daily)", duration: "5 days", instructions: "After food" },
    ]);
  };

  const removeMedRow = (index) => {
    if (medications.length <= 1) return;
    setMedications(medications.filter((_, i) => i !== index));
  };

  const compilePrescription = () => {
    const valid = medications.filter((m) => m.name.trim().length > 0);
    if (valid.length === 0) return consultationData.prescription;
    const formatted = valid
      .map((m, i) => `${i + 1}. ${m.name} (${m.dosage || "Std dose"}) - ${m.frequency} x ${m.duration} [${m.instructions}]`)
      .join("\n");
    return formatted;
  };

  const handleSaveNotes = async () => {
    try {
      const finalRx = compilePrescription();
      await updateNotes(id, {
        diagnosis: consultationData.diagnosis,
        notes: consultationData.notes,
        prescription: finalRx,
      });

      // Also persist to patient prescriptions array if patient exists
      if (currentAppointment?.patient?._id && finalRx) {
        await issuePrescription(currentAppointment.patient._id, {
          appointmentId: id,
          fullPrescriptionText: finalRx,
        }).catch(() => {});
      }

      toast.success("Consultation notes & prescription draft saved.");
    } catch (error) {
      toast.error(error.message || "Failed to save notes");
    }
  };

  const handleCompleteConsultation = async () => {
    try {
      const finalRx = compilePrescription();
      await updateNotes(id, {
        diagnosis: consultationData.diagnosis,
        notes: consultationData.notes,
        prescription: finalRx,
      });

      if (currentAppointment?.patient?._id && finalRx) {
        await issuePrescription(currentAppointment.patient._id, {
          appointmentId: id,
          fullPrescriptionText: finalRx,
        }).catch(() => {});
      }

      await updateStatus(id, "Completed");
      toast.success("Consultation finalized and marked as completed!");
      navigate("/doctor/appointments");
    } catch (error) {
      toast.error(error.message || "Failed to complete appointment");
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!fileToUpload || !currentAppointment?.patient?._id) {
      toast.error("Please choose a file to upload.");
      return;
    }
    setUploadingDoc(true);
    try {
      await uploadToPatient(currentAppointment.patient._id, fileToUpload);
      toast.success("Document attached to patient's medical record!");
      setFileToUpload(null);
      fetchAppointmentById(id);
    } catch (err) {
      toast.error(err.message || "Failed to upload document.");
    } finally {
      setUploadingDoc(false);
    }
  };

  if (loading && !currentAppointment) {
    return <Loader label="Loading appointment details..." />;
  }

  if (!currentAppointment) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        Appointment not found.
      </div>
    );
  }

  const { patient, hospital, status, appointmentDate, appointmentTime, reason, symptoms } = currentAppointment;
  const isEditable = ["Pending", "Confirmed", "Rescheduled"].includes(status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/doctor/appointments")}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-1"
          >
            <ArrowLeft size={14} /> Back to Appointments
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Consultation Suite: {patient?.name || "Patient"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record clinical findings, write prescriptions, and finalize consultation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setDossierOpen(true)} icon={FileText}>
            Open Full EHR Dossier
          </Button>
          {isEditable && (
            <Button variant="primary" size="sm" onClick={handleCompleteConsultation} icon={CheckCircle}>
              Finalize Visit
            </Button>
          )}
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Patient Profile & Booking Meta */}
        <div className="space-y-6 lg:col-span-1">
          {/* Patient Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-blue-100 dark:bg-emerald-500/20 flex items-center justify-center font-bold text-blue-700 dark:text-emerald-300 overflow-hidden border border-blue-200 dark:border-emerald-500/30">
                {patient?.profilePic ? (
                  <img src={patient.profilePic} alt={patient.name} className="h-full w-full object-cover" />
                ) : (
                  patient?.name?.charAt(0) || "P"
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">{patient?.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{patient?.email}</p>
                <p className="text-[11px] font-mono text-blue-600 dark:text-emerald-400 mt-0.5">UID: {patient?.uid}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/40">
                <span className="text-slate-400">Gender</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{patient?.gender || "N/A"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/40">
                <span className="text-slate-400">Age</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {patient?.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs` : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[11px]">Appointment Information</h3>
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Clock size={13} /> Time & Date</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {new Date(appointmentDate).toLocaleDateString()} at {appointmentTime}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Building2 size={13} /> Facility</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{hospital?.name || "Medical Clinic"}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Status</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                status === "Completed"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
              }`}>
                {status}
              </span>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400">Chief Complaint:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 mt-1 bg-slate-50 p-2.5 rounded-xl dark:bg-slate-800/40">
                {reason}
              </p>
            </div>

            {symptoms && symptoms.length > 0 && (
              <div>
                <span className="text-slate-500 dark:text-slate-400">Reported Symptoms:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {symptoms.map((s, i) => (
                    <span key={i} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Document to Record */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[11px] mb-3">Attach File / Lab Report</h3>
            <form onSubmit={handleUploadReport} className="space-y-3">
              <input
                type="file"
                onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-emerald-500/10 dark:file:text-emerald-400"
              />
              <Button type="submit" size="sm" variant="secondary" loading={uploadingDoc} icon={Upload} className="w-full">
                Upload to Patient Record
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Clinical Diagnosis & Multi-drug Rx */}
        <div className="space-y-6 lg:col-span-2">
          {/* Clinical Findings & Diagnosis */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <ClipboardList size={18} className="text-blue-600 dark:text-emerald-400" />
              <span>Clinical Observations & Diagnosis</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Primary Diagnosis (ICD-10 / Clinical Name)
              </label>
              <input
                type="text"
                name="diagnosis"
                value={consultationData.diagnosis}
                onChange={handleConsultationChange}
                disabled={!isEditable}
                placeholder="e.g. Acute Pharyngitis, Type 2 Diabetes Mellitus"
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Clinical Examination & Vitals Notes
              </label>
              <textarea
                name="notes"
                rows="4"
                value={consultationData.notes}
                onChange={handleConsultationChange}
                disabled={!isEditable}
                placeholder="Observations, BP, Pulse, SPO2, respiratory sounds, abdomen exam, follow-up advice..."
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Interactive Prescription Builder */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                <Pill size={18} className="text-blue-600 dark:text-emerald-400" />
                <span>Prescription Builder (Rx)</span>
              </div>
              {isEditable && (
                <button
                  type="button"
                  onClick={addMedRow}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  <Plus size={14} /> Add Medicine
                </button>
              )}
            </div>

            {/* If there's an existing prescription text and no active multi-med edit */}
            {consultationData.prescription && !isEditable ? (
              <pre className="font-mono text-xs whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:border-slate-800 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200">
                {consultationData.prescription}
              </pre>
            ) : (
              <div className="space-y-3">
                {medications.map((med, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Medication #{idx + 1}</span>
                      {isEditable && medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedRow(idx)}
                          className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Drug / Medication Name"
                        value={med.name}
                        onChange={(e) => handleMedChange(idx, "name", e.target.value)}
                        disabled={!isEditable}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 500mg, 10ml)"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(idx, "dosage", e.target.value)}
                        disabled={!isEditable}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={med.frequency}
                        onChange={(e) => handleMedChange(idx, "frequency", e.target.value)}
                        disabled={!isEditable}
                        className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        <option value="1-0-1 (Twice daily)">1-0-1 (Twice daily)</option>
                        <option value="1-1-1 (Thrice daily)">1-1-1 (Thrice daily)</option>
                        <option value="1-0-0 (Once Morning)">1-0-0 (Once Morning)</option>
                        <option value="0-0-1 (Once Night)">0-0-1 (Once Night)</option>
                        <option value="SOS / When Needed">SOS / When Needed</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Duration (e.g. 5 days)"
                        value={med.duration}
                        onChange={(e) => handleMedChange(idx, "duration", e.target.value)}
                        disabled={!isEditable}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />

                      <input
                        type="text"
                        placeholder="Instructions (e.g. After food)"
                        value={med.instructions}
                        onChange={(e) => handleMedChange(idx, "instructions", e.target.value)}
                        disabled={!isEditable}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Actions */}
            {isEditable && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button variant="secondary" onClick={handleSaveNotes} icon={Edit3}>
                  Save Draft
                </Button>
                <Button variant="primary" onClick={handleCompleteConsultation} icon={CheckCircle}>
                  Complete Consultation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Dossier Modal */}
      <PatientDossierModal
        isOpen={dossierOpen}
        onClose={() => setDossierOpen(false)}
        patientId={patient?._id}
      />
    </div>
  );
}
