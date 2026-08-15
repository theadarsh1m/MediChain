import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Calendar,
  Clock,
  FileText,
  Heart,
  Pill,
  Plus,
  Stethoscope,
  Upload,
  User,
  Users,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Eye,
  CalendarDays,
  FileHeart,
  HeartPulse,
  Thermometer,
  Scale,
  Bed,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../ui/Button";
import StatCard from "../../ui/StatCard";
import EmptyState from "../../ui/EmptyState";
import PrescriptionViewerModal from "../../patient/PrescriptionViewerModal";
import DoctorDetailModal from "../../patient/DoctorDetailModal";
import UploadReportModal from "../modals/UploadReportModal";
import { useAppointmentStore } from "../../../store/appointmentStore";
import { uploadReportRequest } from "../../../api/patient";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { fetchPatientProfile } from "../../../features/patient/patientThunks";

export default function PatientDashboardContainer({ patient }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { appointments, fetchAppointments } = useAppointmentStore();

  const [activeModal, setActiveModal] = useState(null); // 'upload' | 'prescription' | 'doctor' | null
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchAppointments().catch(() => {});
  }, [fetchAppointments]);

  // Determine Greeting based on time of day
  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17) greeting = "Good evening";

  const firstName = patient?.name ? patient.name.split(" ")[0] : "there";

  // Vitals
  const vitals = patient?.currentHealth?.vitals || {
    bloodPressure: "120/80",
    heartRate: "72",
    temperature: "98.6",
    weight: "60",
    spO2: "98",
  };

  // Appointments Analysis
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
  );

  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingAppointment = sortedAppointments.find((apt) => {
    const aptDateStr = new Date(apt.appointmentDate).toISOString().split("T")[0];
    const isActive = ["Confirmed", "Pending", "Requested", "Rescheduled", "In Progress"].includes(
      apt.status
    );
    return aptDateStr >= todayStr && isActive;
  }) || sortedAppointments.find((a) => ["Confirmed", "Pending", "Requested"].includes(a.status));

  // Prescriptions Analysis
  const pastConsultations = patient?.admin?.pastConsultations || [];
  const rawPrescriptions = patient?.admin?.prescriptions || [];
  const currentMedications = patient?.currentHealth?.medications || [];

  const totalPrescriptionsCount = Math.max(
    rawPrescriptions.length,
    pastConsultations.filter((c) => c.prescription || c.prescriptionsList?.length > 0).length,
    currentMedications.length
  );

  // Latest Prescription Extraction
  const latestConsultation = pastConsultations[pastConsultations.length - 1] || null;
  const latestRawPrescription = rawPrescriptions[rawPrescriptions.length - 1] || null;
  const latestMedication = currentMedications[0] || null;

  // Documents Analysis
  const labReports = patient?.diagnostics?.labReports || [];
  const medicalDocuments = patient?.admin?.medicalDocuments || [];
  const allDocs = [
    ...labReports.map((url, i) => ({
      name: `Lab Diagnostic Report #${i + 1}`,
      url,
      date: "Recent",
      type: "Lab Report",
    })),
    ...medicalDocuments.map((url, i) => ({
      name: `Medical Document #${i + 1}`,
      url,
      date: "Uploaded",
      type: "Document",
    })),
  ];

  const recentDocs = allDocs.slice(-3).reverse();

  // Doctors list extraction
  const doctorMap = {};
  appointments.forEach((apt) => {
    if (apt.doctor && !doctorMap[apt.doctor._id || apt.doctor.name]) {
      doctorMap[apt.doctor._id || apt.doctor.name] = {
        ...apt.doctor,
        hospital: apt.hospital?.name || "MediVault Clinical Center",
      };
    }
  });

  pastConsultations.forEach((c) => {
    if (c.doctorName && !doctorMap[c.doctorName]) {
      doctorMap[c.doctorName] = {
        name: c.doctorName.replace("Dr. ", ""),
        specialization: c.doctorSpecialization || "Consultant Physician",
        hospital: "MediVault Network",
      };
    }
  });

  const myDoctors = Object.values(doctorMap).slice(0, 3);

  // Recent Medical Activity Feed Construction
  const recentActivities = [];

  if (latestConsultation) {
    recentActivities.push({
      dateBadge: "Today",
      title: "Consultation Completed",
      subtitle: `Dr. ${latestConsultation.doctorName || "Treating Physician"} · ${latestConsultation.diagnosis || "General Evaluation"}`,
      action: () => handleOpenPrescription(latestConsultation.prescription, latestConsultation),
    });
  }

  if (rawPrescriptions.length > 0 || currentMedications.length > 0) {
    recentActivities.push({
      dateBadge: "Recent",
      title: "Prescription Active",
      subtitle: latestMedication
        ? `${latestMedication.name} (${latestMedication.dosage || "Std dose"})`
        : "Medical prescription updated",
      action: () => handleOpenPrescription(latestRawPrescription, latestConsultation),
    });
  }

  if (allDocs.length > 0) {
    recentActivities.push({
      dateBadge: "Uploaded",
      title: "Medical Report Document",
      subtitle: recentDocs[0]?.name || "Diagnostic scan added to record",
      action: () => navigate("/patient/diagnostics"),
    });
  }

  if (upcomingAppointment) {
    recentActivities.push({
      dateBadge: new Date(upcomingAppointment.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      title: "Appointment Scheduled",
      subtitle: `Dr. ${upcomingAppointment.doctor?.name || "Specialist"} · ${upcomingAppointment.appointmentTime}`,
      action: () => navigate("/patient/appointments"),
    });
  }

  const handleOpenPrescription = (prescription, consultation = null) => {
    setSelectedPrescription(prescription);
    setSelectedConsultation(consultation || latestConsultation);
    setActiveModal("prescription");
  };

  const handleOpenDoctor = (doc) => {
    setSelectedDoctor(doc);
    setActiveModal("doctor");
  };

  const handleUploadSubmission = async (file) => {
    try {
      await uploadReportRequest(file);
      toast.success("Medical document uploaded successfully!");
      dispatch(fetchPatientProfile());
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to upload document");
      throw error;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* 1. Welcome / Patient Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/40 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/60">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-blue-100 dark:bg-emerald-500/20 flex items-center justify-center font-bold text-blue-700 dark:text-emerald-300 text-xl border border-blue-200 dark:border-emerald-500/30 overflow-hidden shadow-sm">
            {patient?.profilePic ? (
              <img src={patient.profilePic} alt={patient.name} className="h-full w-full object-cover" />
            ) : (
              patient?.name?.charAt(0) || "P"
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {greeting}, {firstName} 👋
              </h1>
              {patient?.bloodGroup && (
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                  {patient.bloodGroup}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Here's your personal health overview • Patient ID:{" "}
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {patient?.uid || "MED-PAT-XXXX"}
              </span>
            </p>
          </div>
        </div>

        {/* Quick Shortcut in Banner */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link to="/patient/appointments/book">
            <Button variant="primary" size="sm" icon={Plus} className="text-xs">
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. 🩺 Health Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Latest Vitals"
          value={vitals.bloodPressure || "120/80"}
          icon={HeartPulse}
          colorClass={{ bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" }}
          helper={`HR: ${vitals.heartRate || 72} bpm • ${vitals.temperature || 98.6}°F`}
        />
        <StatCard
          label="Next Appointment"
          value={upcomingAppointment ? upcomingAppointment.appointmentTime || "Upcoming" : "No Bookings"}
          icon={Calendar}
          colorClass={{ bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" }}
          helper={
            upcomingAppointment
              ? `Dr. ${upcomingAppointment.doctor?.name || "Specialist"}`
              : "Ready for scheduling"
          }
        />
        <StatCard
          label="Active Prescriptions"
          value={totalPrescriptionsCount}
          icon={Pill}
          colorClass={{ bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" }}
          helper={totalPrescriptionsCount > 0 ? "Under physician order" : "None active"}
        />
        <StatCard
          label="Medical Records"
          value={allDocs.length}
          icon={FileText}
          colorClass={{ bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" }}
          helper={`${labReports.length} reports, ${medicalDocuments.length} files`}
        />
      </div>

      {/* Main Grid: Left 2 Columns & Right 1 Column */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* 3. 📅 Next Appointment (Hero Module) */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Appointment</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your next scheduled clinical consultation.
                </p>
              </div>
              <Link
                to="/patient/appointments"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-emerald-400 flex items-center gap-1"
              >
                All Bookings <ChevronRight size={14} />
              </Link>
            </div>

            {upcomingAppointment ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    <CalendarDays size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                        Dr. {upcomingAppointment.doctor?.name || "Specialist Physician"}
                      </h3>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {upcomingAppointment.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {upcomingAppointment.doctor?.specialization || "Clinical Practice"} •{" "}
                      {upcomingAppointment.hospital?.name || "MediVault Medical Center"}
                    </p>
                    <p className="text-xs font-semibold text-blue-700 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
                      <Clock size={13} />
                      {new Date(upcomingAppointment.appointmentDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at {upcomingAppointment.appointmentTime}
                    </p>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <Link to="/patient/appointments">
                    <Button variant="primary" size="sm" icon={Eye} className="text-xs">
                      View Appointment
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
                <Calendar size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No upcoming appointments</p>
                <p className="text-xs text-slate-500 mt-0.5 mb-4">
                  Stay proactive with regular health checkups and consultations.
                </p>
                <Link to="/patient/appointments/book">
                  <Button variant="primary" size="sm" icon={Plus} className="text-xs">
                    Book an Appointment
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* 4. ❤️ Latest Vitals */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Latest Vitals</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Most recent biometric measurements recorded in your EHR.
                </p>
              </div>
              <Link
                to="/patient/current-health"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-emerald-400 flex items-center gap-1"
              >
                View Health History <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
                  <Activity size={14} className="text-blue-500" /> Blood Pressure
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {vitals.bloodPressure || "120/80"}
                </p>
                <span className="text-[10px] text-slate-400">mmHg</span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
                  <Heart size={14} className="text-rose-500" /> Heart Rate
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {vitals.heartRate || "72"}
                </p>
                <span className="text-[10px] text-slate-400">BPM</span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
                  <Thermometer size={14} className="text-amber-500" /> Temperature
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {vitals.temperature || "98.6"}°F
                </p>
                <span className="text-[10px] text-slate-400">Normal</span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
                  <Scale size={14} className="text-emerald-500" /> Weight
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {vitals.weight || "60"}
                </p>
                <span className="text-[10px] text-slate-400">kg</span>
              </div>
            </div>
          </div>

          {/* 5. 📋 Recent Medical Activity */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No recent health activity records found.</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act, i) => (
                  <div
                    key={i}
                    onClick={act.action}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/40 p-3.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="rounded-xl bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 shrink-0">
                        {act.dateBadge}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{act.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{act.subtitle}</p>
                      </div>
                    </div>

                    <ChevronRight size={14} className="text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Prescriptions, Documents, My Doctors, Quick Actions */}
        <div className="space-y-6">
          {/* 9. ⚡ Quick Actions */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-2">
              <Link
                to="/patient/appointments/book"
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 transition text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <Plus size={15} className="text-blue-600" /> Book Appointment
                </span>
                <ChevronRight size={14} className="text-slate-400" />
              </Link>

              <button
                onClick={() => setActiveModal("upload")}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 transition text-xs font-bold text-slate-800 dark:text-slate-200 text-left w-full"
              >
                <span className="flex items-center gap-2.5">
                  <Upload size={15} className="text-purple-600" /> Upload Report
                </span>
                <ChevronRight size={14} className="text-slate-400" />
              </button>

              <button
                onClick={() => handleOpenPrescription(latestRawPrescription, latestConsultation)}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 transition text-xs font-bold text-slate-800 dark:text-slate-200 text-left w-full"
              >
                <span className="flex items-center gap-2.5">
                  <Pill size={15} className="text-emerald-600" /> View Prescriptions
                </span>
                <ChevronRight size={14} className="text-slate-400" />
              </button>

              <Link
                to="/patient/current-health"
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 transition text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <Heart size={15} className="text-rose-600" /> View Vitals
                </span>
                <ChevronRight size={14} className="text-slate-400" />
              </Link>

              <Link
                to="/patient/medical-history"
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 transition text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <FileText size={15} className="text-amber-600" /> Medical History
                </span>
                <ChevronRight size={14} className="text-slate-400" />
              </Link>
            </div>
          </div>

          {/* 6. 💊 Recent Prescription */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Latest Prescription</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                Active Order
              </span>
            </div>

            {latestConsultation || latestRawPrescription || latestMedication ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Dr. {latestConsultation?.doctorName || "Rahul Sharma"}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {latestConsultation?.date
                      ? new Date(latestConsultation.date).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "14 Aug 2026"}
                  </span>
                </div>

                <div className="rounded-xl bg-white p-2.5 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-blue-700 dark:text-emerald-400">
                    {latestConsultation?.prescriptionsList?.[0]?.medicineName ||
                      latestMedication?.name ||
                      "Paracetamol"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {latestConsultation?.prescriptionsList?.[0]?.dosage ||
                      latestMedication?.dosage ||
                      "500mg"} · {latestConsultation?.prescriptionsList?.[0]?.frequency || "2x/day"} · {latestConsultation?.prescriptionsList?.[0]?.duration || "3 days"}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs mt-2"
                  icon={Eye}
                  onClick={() => handleOpenPrescription(latestRawPrescription, latestConsultation)}
                >
                  View Prescription
                </Button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2">No active prescriptions on file.</p>
            )}
          </div>

          {/* 7. 📄 Recent Documents */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Documents</h2>
              <Link
                to="/patient/diagnostics"
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-emerald-400"
              >
                View All
              </Link>
            </div>

            {recentDocs.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No uploaded reports found.</p>
            ) : (
              <div className="space-y-2">
                {recentDocs.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 transition text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-blue-500 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.name}</span>
                    </div>
                    <ExternalLink size={12} className="text-slate-400 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* 8. 👨‍⚕️ My Doctors */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">My Doctors</h2>
            {myDoctors.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No doctor consultation history yet.</p>
            ) : (
              <div className="space-y-2.5">
                {myDoctors.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Dr. {doc.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {doc.specialization || doc.department || "Cardiology"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenDoctor(doc)}
                        className="rounded-xl bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      >
                        View
                      </button>
                      <Link to={`/patient/appointments/book?doctor=${doc._id || ""}`}>
                        <button className="rounded-xl bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700">
                          Book
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadReportModal
        isOpen={activeModal === "upload"}
        onClose={() => setActiveModal(null)}
        onUpload={handleUploadSubmission}
      />

      <PrescriptionViewerModal
        isOpen={activeModal === "prescription"}
        onClose={() => {
          setActiveModal(null);
          setSelectedPrescription(null);
          setSelectedConsultation(null);
        }}
        prescription={selectedPrescription}
        consultation={selectedConsultation}
      />

      <DoctorDetailModal
        isOpen={activeModal === "doctor"}
        onClose={() => {
          setActiveModal(null);
          setSelectedDoctor(null);
        }}
        doctor={selectedDoctor}
      />
    </div>
  );
}
