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
} from "lucide-react";
import toast from "react-hot-toast";

import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
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

  const statusColors = {
    Available: "bg-emerald-500 text-white",
    "In Consultation": "bg-blue-600 text-white",
    "On Break": "bg-amber-500 text-white",
    Offline: "bg-slate-500 text-white",
  };

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
            {profile?.hospital || "MediVault Medical Network"} • Today is{" "}
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
          label="Today's Schedule"
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
          helper="Awaiting approval"
        />
        <StatCard
          label="Total Patients"
          value={metrics.totalPatientsCount}
          icon={Users2}
          colorClass={{ bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" }}
          helper="EHR Records managed"
        />
        <StatCard
          label="Practitioner Rating"
          value={`${metrics.averageRating} ★`}
          icon={Sparkles}
          colorClass={{ bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" }}
          helper="Consultation satisfaction"
        />
      </div>

      {/* Main Grid: Left (Queue & Activity), Right (Quick Actions & Status) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Pending Approval Banner if any */}
          {pendingRequests.length > 0 && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/30 dark:bg-amber-950/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <AlertCircle size={18} />
                  <span>{pendingRequests.length} New Appointment Request(s)</span>
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

          {/* Today's Live Consultation Queue */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Consultation Queue</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active and upcoming patients for today.</p>
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
                title="No Consultations Today"
                description="You have no appointments scheduled for today. Take a break or inspect patient records."
              />
            ) : (
              <div className="space-y-3">
                {todayQueue.map((apt) => (
                  <div
                    key={apt._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-100 dark:bg-emerald-500/20 flex items-center justify-center font-bold text-blue-700 dark:text-emerald-300 overflow-hidden border border-blue-200 dark:border-emerald-500/30">
                        {apt.patient?.profilePic ? (
                          <img src={apt.patient.profilePic} alt={apt.patient.name} className="h-full w-full object-cover" />
                        ) : (
                          apt.patient?.name?.charAt(0) || "P"
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{apt.patient?.name}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            apt.status === "Confirmed"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300"
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          Time: <strong className="text-slate-700 dark:text-slate-300">{apt.appointmentTime}</strong> • {apt.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={FileText}
                        onClick={() => openDossier(apt.patient?._id)}
                      >
                        EHR
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Stethoscope}
                        onClick={() => navigate(`/doctor/appointments/${apt._id}`)}
                      >
                        Consult
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Consultations History Feed */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Consultations</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Completed visits and clinical logs.</p>
              </div>
            </div>

            {recentConsultations.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No consultation logs recorded yet.</p>
            ) : (
              <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-5">
                {recentConsultations.map((c, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-1.5 flex h-2.5 w-2.5 rounded-full bg-blue-500 dark:bg-emerald-400" />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {c.patient?.name || "Patient Consultation"}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.updatedAt || c.appointmentDate).toLocaleDateString()}
                        </span>
                      </div>
                      {c.diagnosis && (
                        <p className="text-xs font-semibold text-blue-600 dark:text-emerald-400 mt-0.5">
                          Dx: {c.diagnosis}
                        </p>
                      )}
                      {c.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {c.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col) - Quick Actions & Tools */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Doctor Toolkit</h2>
            <div className="grid gap-3">
              <button
                onClick={() => {
                  setRxTargetPatient(null);
                  setRxModalOpen(true);
                }}
                className="flex items-center justify-between rounded-2xl border border-slate-200/80 p-4 hover:border-blue-300 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40 text-left transition w-full group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-emerald-400 transition">
                    Write Prescription (Rx)
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Create & dispatch medications
                  </p>
                </div>
                <div className="rounded-full bg-blue-50 p-2.5 text-blue-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Pill size={18} />
                </div>
              </button>

              <button
                onClick={() => setLookupModalOpen(true)}
                className="flex items-center justify-between rounded-2xl border border-slate-200/80 p-4 hover:border-blue-300 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40 text-left transition w-full group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-emerald-400 transition">
                    Patient EHR Lookup
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Search history & lab files
                  </p>
                </div>
                <div className="rounded-full bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <Search size={18} />
                </div>
              </button>

              <Link
                to="/doctor/patients"
                className="flex items-center justify-between rounded-2xl border border-slate-200/80 p-4 hover:border-blue-300 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40 text-left transition w-full group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-emerald-400 transition">
                    Patient Directory
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Browse all patient dossiers
                  </p>
                </div>
                <div className="rounded-full bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Users2 size={18} />
                </div>
              </Link>
            </div>
          </div>

          {/* Practice Summary Card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Practice Details</h2>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Consultation Fee</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  ${profile?.consultationFee || 50} / visit
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Telemedicine</span>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                  {profile?.allowTelemedicine ?? true ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Medical License</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {profile?.licenseNumber || "LIC-REG-1049"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Languages</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {Array.isArray(profile?.preferredLanguages)
                    ? profile.preferredLanguages.join(", ")
                    : profile?.preferredLanguages || "English"}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/doctor/settings"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800 transition"
              >
                Configure Availability & Hours
              </Link>
            </div>
          </div>

          {/* Security & Verification Seal */}
          <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 text-blue-700 dark:text-emerald-400 mb-2">
              <ShieldCheck size={20} />
              <h3 className="font-bold text-sm">Blockchain Verified Practitioner</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              All clinical notes and prescriptions issued from this dashboard are cryptographically signed and stored in compliance with MediVault protocol.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QuickPrescriptionModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        defaultPatient={rxTargetPatient}
      />

      <PatientLookupModal
        isOpen={lookupModalOpen}
        onClose={() => setLookupModalOpen(false)}
        onSelectPatientDossier={(id) => openDossier(id)}
        onOpenRx={(pat) => openPrescriptionForPatient(pat)}
      />

      <PatientDossierModal
        isOpen={Boolean(dossierPatientId)}
        onClose={() => setDossierPatientId(null)}
        patientId={dossierPatientId}
        onOpenRx={(pat) => openPrescriptionForPatient(pat)}
      />

      <ConfirmDialog
        isOpen={confirmModal.open}
        title={confirmModal.action === "accept" ? "Accept Appointment" : "Decline Appointment"}
        description={`Are you sure you want to ${confirmModal.action} this appointment?`}
        confirmLabel={confirmModal.action === "accept" ? "Accept" : "Decline"}
        isDestructive={confirmModal.action === "reject"}
        onConfirm={confirmAppointmentAction}
        onCancel={() => setConfirmModal({ open: false, id: null, action: null })}
      />
    </div>
  );
}
