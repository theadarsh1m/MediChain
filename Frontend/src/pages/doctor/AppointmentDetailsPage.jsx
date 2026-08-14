import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Activity,
  Heart,
  Thermometer,
  Scale,
  Stethoscope,
  Printer,
  AlertTriangle,
} from "lucide-react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import PageHeader from "../../components/ui/PageHeader";
import Section from "../../components/ui/Section";
import PatientDossierModal from "../../components/doctor/PatientDossierModal";
import { useAppointmentStore } from "../../store/appointmentStore";
import { useDoctorStore } from "../../store/doctorStore";
import { uploadToCloudinary } from "../../utils/cloudinary";

export default function AppointmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentAppointment, fetchAppointmentById, updateStatus, loading: appointmentLoading } =
    useAppointmentStore();
  const { completeConsultation, loading: doctorLoading } = useDoctorStore();

  const [dossierOpen, setDossierOpen] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

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
  const [followUpDate, setFollowUpDate] = useState("");
  const [attachments, setAttachments] = useState([]);

  const [medications, setMedications] = useState([
    { medicineName: "Paracetamol", dosage: "500 mg", frequency: "2 times/day", duration: "3 days", instructions: "After food" },
  ]);

  useEffect(() => {
    fetchAppointmentById(id);
  }, [id, fetchAppointmentById]);

  useEffect(() => {
    if (currentAppointment) {
      if (currentAppointment.reason) setSymptoms(currentAppointment.reason);
      if (currentAppointment.diagnosis) setDiagnosis(currentAppointment.diagnosis);
      if (currentAppointment.notes) setDoctorNotes(currentAppointment.notes);
      if (currentAppointment.vitals) setVitals((prev) => ({ ...prev, ...currentAppointment.vitals }));
      if (currentAppointment.followUpDate) {
        setFollowUpDate(new Date(currentAppointment.followUpDate).toISOString().split("T")[0]);
      }
      if (currentAppointment.prescriptionsList && currentAppointment.prescriptionsList.length > 0) {
        setMedications(currentAppointment.prescriptionsList);
      }
      if (currentAppointment.attachments && currentAppointment.attachments.length > 0) {
        setAttachments(currentAppointment.attachments);
      }
    }
  }, [currentAppointment]);

  const handleVitalChange = (field, value) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };

  const handleMedChange = (index, field, value) => {
    const next = [...medications];
    next[index][field] = value;
    setMedications(next);
  };

  const addMedRow = () => {
    setMedications([
      ...medications,
      { medicineName: "", dosage: "500 mg", frequency: "Once daily", duration: "5 days", instructions: "After meals" },
    ]);
  };

  const removeMedRow = (index) => {
    if (medications.length <= 1) return;
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const url = await uploadToCloudinary(file);
      setAttachments((prev) => [...prev, url]);
      toast.success("Diagnostic report uploaded and attached!");
    } catch (err) {
      toast.error(err.message || "Failed to upload file.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error("Please provide a clinical diagnosis before completing consultation.");
      return;
    }

    try {
      await completeConsultation({
        appointmentId: id,
        patientId: currentAppointment.patient?._id,
        symptoms,
        vitals,
        diagnosis,
        notes: doctorNotes,
        prescriptionsList: medications.filter((m) => m.medicineName.trim()),
        followUpDate,
        attachments,
      });

      toast.success("Consultation concluded and saved to patient's EHR records!");
      fetchAppointmentById(id);
    } catch (error) {
      toast.error(error.message || "Failed to complete consultation.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (appointmentLoading && !currentAppointment) {
    return <Loader label="Loading consultation details..." />;
  }

  if (!currentAppointment) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Appointment record not found.</p>
        <Link to="/doctor/appointments" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
          Back to Queue
        </Link>
      </div>
    );
  }

  const patient = currentAppointment.patient;
  const isCompleted = currentAppointment.status === "Completed";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/doctor/appointments")}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Clinical Consultation Suite
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Session ID: <span className="font-mono">{currentAppointment._id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint}>
            Print Rx
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={FileText}
            onClick={() => setDossierOpen(true)}
          >
            Full EHR Dossier
          </Button>
        </div>
      </div>

      {/* Patient Profile Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-blue-100 dark:bg-emerald-500/20 flex items-center justify-center font-bold text-blue-700 dark:text-emerald-300 text-xl border border-blue-200 dark:border-emerald-500/30 overflow-hidden">
              {patient?.profilePic ? (
                <img src={patient.profilePic} alt={patient.name} className="h-full w-full object-cover" />
              ) : (
                patient?.name?.charAt(0) || "P"
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{patient?.name}</h2>
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                  {patient?.bloodGroup || "O+"}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isCompleted
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  }`}
                >
                  {currentAppointment.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                UID: <span className="font-mono">{patient?.uid}</span> • Gender: {patient?.gender || "Male"} • Age:{" "}
                {patient?.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs` : "N/A"}
              </p>
            </div>
          </div>

          {/* Time & Date */}
          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 self-start md:self-center">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-slate-400">Date & Time</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {new Date(currentAppointment.appointmentDate).toLocaleDateString()} at {currentAppointment.appointmentTime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Clinical Form */}
      <form onSubmit={handleCompleteConsultation} className="space-y-6">
        {/* Chief Symptoms */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Chief Symptoms & Patient Complaints
          </label>
          <textarea
            rows={2}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Document patient complaints, duration of onset, and pain triggers..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Vitals Matrix */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Vitals Recorded During Session
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
                <Heart size={13} className="text-rose-500" /> Heart Rate (bpm)
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

        {/* Diagnosis & Follow-up */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Clinical Diagnosis *
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Pharyngitis / Seasonal Allergies"
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm"
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recommended Follow-Up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm"
            />
          </div>
        </div>

        {/* Doctor Clinical Notes */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            4. Clinical Observations & Doctor Notes
          </label>
          <textarea
            rows={3}
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            placeholder="Clinical evaluation observations, dietary precautions, hydration orders, lifestyle advice..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Prescription Builder */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              5. Prescription Order (Rx)
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={addMedRow}
              className="text-xs"
            >
              Add Medicine
            </Button>
          </div>

          <div className="space-y-3">
            {medications.map((m, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/40 items-center"
              >
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Medicine Name (e.g. Paracetamol)"
                    value={m.medicineName}
                    onChange={(e) => handleMedChange(idx, "medicineName", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Dosage (500 mg)"
                    value={m.dosage}
                    onChange={(e) => handleMedChange(idx, "dosage", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Frequency (2 times/day)"
                    value={m.frequency}
                    onChange={(e) => handleMedChange(idx, "frequency", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Duration (3 days)"
                    value={m.duration}
                    onChange={(e) => handleMedChange(idx, "duration", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Instructions (After food)"
                    value={m.instructions}
                    onChange={(e) => handleMedChange(idx, "instructions", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeMedRow(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostics & Lab Reports */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            6. Diagnostic Attachments & Lab Reports
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60 cursor-pointer transition">
              <Upload size={15} />
              <span>{uploadingDoc ? "Uploading..." : "Upload Lab Report / X-Ray"}</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                disabled={uploadingDoc}
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

        {/* Save & Complete Consultation Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate("/doctor/appointments")}>
            Back to Queue
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={doctorLoading}
            icon={CheckCircle}
          >
            Complete Consultation & Write EHR
          </Button>
        </div>
      </form>

      {/* Patient Dossier Modal */}
      <PatientDossierModal
        isOpen={dossierOpen}
        onClose={() => setDossierOpen(false)}
        patientId={patient?._id}
      />
    </div>
  );
}
