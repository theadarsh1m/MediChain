import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  CalendarDays,
  Users2,
  Clock,
  Pill,
  Search,
  CheckCircle,
  XCircle,
  ChevronRight,
  ShieldCheck,
  Activity,
  FileText,
  Stethoscope,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Eye,
  Calendar,
  Play,
  HeartPulse,
} from "lucide-react";
import toast from "react-hot-toast";

import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ConsultationSuiteModal from "../../components/doctor/ConsultationSuiteModal";
import QuickPrescriptionModal from "../../components/doctor/QuickPrescriptionModal";
import PatientLookupModal from "../../components/doctor/PatientLookupModal";
import PatientDossierModal from "../../components/doctor/PatientDossierModal";
import { useDoctorStore } from "../../store/doctorStore";
import { useAppointmentStore } from "../../store/appointmentStore";

export default function DoctorDashboardPage() {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const doctor = outletContext?.doctor;

  const {
    dashboard,
    fetchDashboard,
    profile,
    fetchProfile,
    doctorStatus,
    setDoctorStatus,
    loading: doctorLoading,
  } = useDoctorStore();

  const { updateStatus } = useAppointmentStore();

  // Modals state
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [activeConsultationTarget, setActiveConsultationTarget] = useState({ appointment: null, patient: null });
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [rxTargetPatient, setRxTargetPatient] = useState(null);
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [dossierPatientId, setDossierPatientId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, action: null });

  useEffect(() => {
    fetchDashboard().catch(() => {});
    fetchProfile().catch(() => {});
  }, [fetchDashboard, fetchProfile]);

  const handleRefresh = async () => {
    try {
      await Promise.all([fetchDashboard(), fetchProfile()]);
      toast.success("Doctor dashboard refreshed!");
    } catch {
      toast.error("Failed to refresh dashboard.");
    }
  };

  const handleAction = (id, action) => {
    setConfirmModal({ open: true, id, action });
  };

  const confirmAppointmentAction = async () => {
    const { id, action } = confirmModal;
    const newStatus = action === "accept" ? "Confirmed" : "Cancelled";
    try {
      await updateStatus(id, newStatus);
      toast.success(`Appointment ${newStatus.toLowerCase()}.`);
      setConfirmModal({ open: false, id: null, action: null });
      fetchDashboard();
    } catch (error) {
      toast.error(error.message || `Failed to ${action} appointment`);
    }
  };

  const startConsultation = (appointment, patient = null) => {
    setActiveConsultationTarget({
      appointment,
      patient: patient || appointment?.patient,
    });
    setConsultationModalOpen(true);
  };

  const openPrescriptionForPatient = (patient, appointmentId = null) => {
    setRxTargetPatient(patient);
    setRxModalOpen(true);
  };

  const openDossier = (patientId) => {
    setDossierPatientId(patientId);
  };

  const metrics = dashboard?.metrics || {
    todayCount: 0,
    pendingRequestsCount: 0,
    upcomingCount: 0,
    completedCount: 0,
    totalPatientsCount: 0,
    averageRating: 4.9,
    consultationFee: 50,
  };

  const todayQueue = dashboard?.todayQueue || [];
  const pendingRequests = dashboard?.pendingRequests || [];
  const recentConsultations = dashboard?.recentConsultations || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, Dr. {profile?.name || doctor?.name || "Doctor"}
            </h1>
            <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              {profile?.specialization || doctor?.specialization || "Practitioner"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {profile?.hospital || "MediVault Clinical Suite"} • Today is{" "}
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Doctor Status & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 pl-2">Status:</span>
            <select
              value={doctorStatus}
              onChange={(e) => {
                setDoctorStatus(e.target.value);
                toast.success(`Availability status set to ${e.target.value}`);
              }}
              className="rounded-xl border-none bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="Available">🟢 Available</option>
              <option value="In Consultation">🔵 In Consultation</option>
              <option value="On Break">🟡 On Break</option>
              <option value="Offline">⚪ Offline</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 shadow-sm transition"
          >
            <RefreshCw size={13} className={doctorLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Appointments"
          value={metrics.todayCount}
          icon={CalendarDays}
          colorClass={{ bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" }}
          helper={`${todayQueue.length} patient consultations`}
        />
        <StatCard
          label="Pending Requests"
          value={metrics.pendingRequestsCount}
          icon={Clock}
          colorClass={{ bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" }}
          helper="Awaiting review"
        />
        <StatCard
          label="Total Patients"
          value={metrics.totalPatientsCount}
          icon={Users2}
          colorClass={{ bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" }}
          helper="Authorized under your care"
        />
        <StatCard
          label="Completed Consultations"
          value={metrics.completedCount}
          icon={CheckCircle}
          colorClass={{ bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" }}
          helper="EHR records concluded"
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Primary Schedule & Consultations */}
        <div className="space-y-6 lg:col-span-2">
          {/* Pending Approval Banner if any */}
          {pendingRequests.length > 0 && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/30 dark:bg-amber-950/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <AlertCircle size={18} />
                  <span>{pendingRequests.length} Pending Appointment Request(s)</span>
                </div>
                <Link
                  to="/doctor/appointments"
                  className="text-xs font-semibold text-amber-700 hover:underline dark:text-amber-400 flex items-center gap-1"
                >
                  View All <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-2.5">
                {pendingRequests.map((apt) => (
                  <div
                    key={apt._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200/60 bg-white p-3.5 dark:border-amber-900/40 dark:bg-slate-900"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{apt.patient?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime} • Reason: {apt.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleAction(apt._id, "reject")}
                        icon={XCircle}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAction(apt._id, "accept")}
                        icon={CheckCircle}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's Schedule (Hero Module) */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Schedule</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Timeline of today's booked and waiting consultations.</p>
              </div>
              <Link
                to="/doctor/appointments"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-emerald-400 flex items-center gap-1"
              >
                Full Schedule <ChevronRight size={14} />
              </Link>
            </div>

            {todayQueue.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Consultations Scheduled Today"
                description="No appointments booked for today yet. Use Quick Actions to write a prescription or search a patient record."
              />
            ) : (
              <div className="space-y-3">
                {todayQueue.map((apt) => {
                  const isCompleted = apt.status === "Completed";
                  const isInProgress = apt.status === "In Progress";
                  const isConfirmed = apt.status === "Confirmed";

                  return (
                    <div
                      key={apt._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 transition"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Time Pill */}
                        <div className="h-12 w-16 shrink-0 rounded-2xl bg-blue-100 dark:bg-emerald-500/20 flex flex-col items-center justify-center font-bold text-blue-800 dark:text-emerald-300 border border-blue-200 dark:border-emerald-500/30 text-xs">
                          <span>{apt.appointmentTime || "09:00"}</span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                              {apt.patient?.name}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isCompleted
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                                  : isInProgress
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse"
                                  : isConfirmed
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {isInProgress ? "In Consultation" : isConfirmed ? "Confirmed" : apt.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            UID: <span className="font-mono">{apt.patient?.uid || "PAT-XXX"}</span> • Reason: {apt.reason}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openDossier(apt.patient?._id)}
                          className="text-xs"
                          icon={FileText}
                        >
                          EHR
                        </Button>

                        {!isCompleted ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => startConsultation(apt)}
                            icon={Stethoscope}
                            className="text-xs"
                          >
                            Start Consultation
                          </Button>
                        ) : (
                          <Link to={`/doctor/appointments/${apt._id}`}>
                            <Button size="sm" variant="secondary" className="text-xs" icon={Eye}>
                              Summary
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Patient Consultation Logs */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Clinical Logs</h2>
              <Link
                to="/doctor/patients"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-emerald-400 flex items-center gap-1"
              >
                Patients Directory <ChevronRight size={14} />
              </Link>
            </div>

            {recentConsultations.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No recent consultation logs recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentConsultations.map((item) => (
                  <div key={item._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{item.patient?.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Diagnosis: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.diagnosis || "Consultation Completed"}</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.updatedAt || item.appointmentDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Clinical Actions & Profile */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Clinical Quick Actions</h2>

            <div className="grid gap-3">
              <button
                onClick={() => setLookupModalOpen(true)}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 hover:bg-slate-50/50 hover:shadow-sm transition dark:border-slate-800 dark:hover:bg-slate-800/40 text-left w-full"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Start Consultation</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Lookup patient & open clinical workspace</p>
                </div>
                <div className="rounded-full bg-blue-50 p-2.5 text-blue-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Stethoscope size={18} />
                </div>
              </button>

              <button
                onClick={() => openPrescriptionForPatient(null)}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 hover:bg-slate-50/50 hover:shadow-sm transition dark:border-slate-800 dark:hover:bg-slate-800/40 text-left w-full"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Write Prescription</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Create multi-drug Rx order</p>
                </div>
                <div className="rounded-full bg-blue-50 p-2.5 text-blue-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Pill size={18} />
                </div>
              </button>

              <button
                onClick={() => setLookupModalOpen(true)}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 hover:bg-slate-50/50 hover:shadow-sm transition dark:border-slate-800 dark:hover:bg-slate-800/40 text-left w-full"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Lookup Patient Record</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Search by Email, Phone, or UID</p>
                </div>
                <div className="rounded-full bg-blue-50 p-2.5 text-blue-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Search size={18} />
                </div>
              </button>
            </div>
          </div>

          {/* Practitioner Info Card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Practitioner Profile</h2>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Specialization:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{profile?.specialization || "General Medicine"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Medical License:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{profile?.licenseNumber || "MED-8910"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Hospital Affiliation:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{profile?.hospital || "MediVault Network"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Consultation Fee:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">${profile?.consultationFee || 50}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Consultation Suite Modal */}
      <ConsultationSuiteModal
        isOpen={consultationModalOpen}
        onClose={() => {
          setConsultationModalOpen(false);
          setActiveConsultationTarget({ appointment: null, patient: null });
        }}
        appointment={activeConsultationTarget.appointment}
        patient={activeConsultationTarget.patient}
        onConsultationCompleted={() => fetchDashboard()}
      />

      {/* Modals */}
      <QuickPrescriptionModal
        isOpen={rxModalOpen}
        onClose={() => {
          setRxModalOpen(false);
          setRxTargetPatient(null);
        }}
        patient={rxTargetPatient}
        onPrescriptionIssued={() => fetchDashboard()}
      />

      <PatientLookupModal
        isOpen={lookupModalOpen}
        onClose={() => setLookupModalOpen(false)}
        onSelectPatient={(p) => startConsultation(null, p)}
      />

      <PatientDossierModal
        isOpen={Boolean(dossierPatientId)}
        onClose={() => setDossierPatientId(null)}
        patientId={dossierPatientId}
      />

      <ConfirmDialog
        isOpen={confirmModal.open}
        title={confirmModal.action === "accept" ? "Accept Appointment Request" : "Decline Appointment Request"}
        description={
          confirmModal.action === "accept"
            ? "Are you sure you want to confirm this consultation request?"
            : "Are you sure you want to decline this request?"
        }
        confirmText={confirmModal.action === "accept" ? "Accept" : "Decline"}
        variant={confirmModal.action === "accept" ? "primary" : "danger"}
        onConfirm={confirmAppointmentAction}
        onClose={() => setConfirmModal({ open: false, id: null, action: null })}
      />
    </div>
  );
}
