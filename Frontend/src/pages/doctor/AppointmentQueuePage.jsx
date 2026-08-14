import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  CalendarClock,
  Eye,
  Search,
  Filter,
  Stethoscope,
  FileText,
  Clock,
  Calendar,
  AlertCircle,
  Play,
  RotateCcw,
} from "lucide-react";

import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";
import PageHeader from "../../components/ui/PageHeader";
import ConsultationSuiteModal from "../../components/doctor/ConsultationSuiteModal";
import PatientDossierModal from "../../components/doctor/PatientDossierModal";
import { useAppointmentStore } from "../../store/appointmentStore";

export default function AppointmentQueuePage() {
  const navigate = useNavigate();
  const { appointments, fetchAppointments, updateStatus, loading } = useAppointmentStore();
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, action: null });
  const [activeTab, setActiveTab] = useState("all"); // "all" | "requests" | "confirmed" | "inprogress" | "completed" | "cancelled"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDossierPatientId, setSelectedDossierPatientId] = useState(null);

  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [consultationTarget, setConsultationTarget] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleAction = (id, action) => {
    setConfirmModal({ open: true, id, action });
  };

  const confirmAction = async () => {
    const { id, action } = confirmModal;
    const newStatus = action === "accept" ? "Confirmed" : "Cancelled";
    try {
      await updateStatus(id, newStatus);
      toast.success(`Appointment ${newStatus.toLowerCase()}.`);
      setConfirmModal({ open: false, id: null, action: null });
      fetchAppointments();
    } catch (error) {
      toast.error(error.message || `Failed to ${action} appointment`);
    }
  };

  const startConsultation = async (apt) => {
    if (apt.status === "Confirmed" || apt.status === "Pending" || apt.status === "Requested") {
      try {
        await updateStatus(apt._id, "In Progress");
      } catch {}
    }
    setConsultationTarget(apt);
    setConsultationModalOpen(true);
  };

  if (loading && appointments.length === 0) {
    return <Loader label="Loading your appointment queue..." />;
  }

  // Filter appointments
  const filtered = appointments.filter((apt) => {
    const matchesSearch =
      !searchTerm ||
      apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patient?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patient?.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "requests") return apt.status === "Requested";
    if (activeTab === "confirmed") return apt.status === "Confirmed";
    if (activeTab === "inprogress") return apt.status === "In Progress";
    if (activeTab === "completed") return apt.status === "Completed";
    if (activeTab === "cancelled") return apt.status === "Cancelled";

    return true;
  });

  const requestedCount = appointments.filter((a) => a.status === "Requested").length;
  const confirmedCount = appointments.filter((a) => a.status === "Confirmed").length;
  const inProgressCount = appointments.filter((a) => a.status === "In Progress").length;
  const completedCount = appointments.filter((a) => a.status === "Completed").length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Requested":
        return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300";
      case "Confirmed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300";
      case "In Progress":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 animate-pulse";
      case "Completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultation Queue & Clinical Schedule"
        description="Review pending appointment requests, manage confirmed queues, and conduct consultations."
      />

      {/* Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900">
          {[
            { id: "all", label: "All", count: appointments.length },
            { id: "requests", label: "Pending Requests", count: requestedCount, highlight: requestedCount > 0 },
            { id: "confirmed", label: "Confirmed", count: confirmedCount },
            { id: "inprogress", label: "In Progress", count: inProgressCount, highlight: inProgressCount > 0 },
            { id: "completed", label: "Completed", count: completedCount },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white dark:bg-emerald-500 dark:text-slate-950"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isActive
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-slate-950"
                        : tab.highlight
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search patient, UID, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-sm"
          />
        </div>
      </div>

      {/* Appointments List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No Appointments in this Queue"
          description={
            searchTerm
              ? `No appointments found matching "${searchTerm}".`
              : `You have no appointments currently in the ${activeTab} queue.`
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((apt) => {
            const isRequest = apt.status === "Requested";
            const isCompleted = apt.status === "Completed";
            const isInProgress = apt.status === "In Progress";

            return (
              <div
                key={apt._id}
                className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-emerald-500/10 flex items-center justify-center font-bold text-blue-700 dark:text-emerald-300 overflow-hidden border border-slate-200 dark:border-slate-800">
                    {apt.patient?.profilePic ? (
                      <img src={apt.patient.profilePic} alt={apt.patient.name} className="h-full w-full object-cover" />
                    ) : (
                      apt.patient?.name?.charAt(0) || "P"
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusBadge(apt.status)}`}>
                        {apt.status}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar size={13} />
                        {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                      {apt.patient?.name || "Patient"}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      <strong className="text-slate-700 dark:text-slate-300">Reason:</strong> {apt.reason}
                    </p>

                    {apt.diagnosis && (
                      <p className="text-xs font-semibold text-blue-600 dark:text-emerald-400 mt-1">
                        Diagnosis: {apt.diagnosis}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:self-center">
                  {isRequest ? (
                    <div className="flex gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleAction(apt._id, "reject")}
                        icon={XCircle}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAction(apt._id, "accept")}
                        icon={CheckCircle}
                      >
                        Accept
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedDossierPatientId(apt.patient?._id)}
                        icon={FileText}
                      >
                        EHR Dossier
                      </Button>

                      {!isCompleted ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => startConsultation(apt)}
                          icon={Stethoscope}
                        >
                          {isInProgress ? "Resume Consultation" : "Start Consultation"}
                        </Button>
                      ) : (
                        <Link to={`/doctor/appointments/${apt._id}`}>
                          <Button size="sm" variant="secondary" icon={Eye}>
                            View Summary
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Consultation Suite Modal */}
      <ConsultationSuiteModal
        isOpen={consultationModalOpen}
        onClose={() => {
          setConsultationModalOpen(false);
          setConsultationTarget(null);
        }}
        appointment={consultationTarget}
        onConsultationCompleted={() => fetchAppointments()}
      />

      {/* Patient Dossier Modal */}
      <PatientDossierModal
        isOpen={Boolean(selectedDossierPatientId)}
        onClose={() => setSelectedDossierPatientId(null)}
        patientId={selectedDossierPatientId}
      />

      {/* Accept / Reject Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.open}
        title={confirmModal.action === "accept" ? "Accept Appointment" : "Decline Appointment"}
        description={`Are you sure you want to ${confirmModal.action} this appointment?`}
        confirmLabel={confirmModal.action === "accept" ? "Accept" : "Decline"}
        isDestructive={confirmModal.action === "reject"}
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal({ open: false, id: null, action: null })}
        loading={loading}
      />
    </div>
  );
}
