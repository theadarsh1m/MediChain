import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, CalendarClock, Eye } from "lucide-react";

import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";
import PageHeader from "../../components/ui/PageHeader";
import Section from "../../components/ui/Section";
import { useAppointmentStore } from "../../store/appointmentStore";

export default function AppointmentQueuePage() {
  const navigate = useNavigate();
  const { appointments, fetchAppointments, updateStatus, loading } = useAppointmentStore();
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, action: null });

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
    } catch (error) {
      toast.error(error.message || `Failed to ${action} appointment`);
    }
  };

  if (loading && appointments.length === 0) {
    return <Loader label="Loading your queue..." />;
  }

  const requested = appointments.filter((a) => a.status === "Requested");
  const upcoming = appointments.filter((a) => ["Pending", "Confirmed", "Rescheduled"].includes(a.status));

  const AppointmentCard = ({ apt, isRequest }) => (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${isRequest ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"}`}>
            {apt.status}
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {apt.patient?.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong>Reason:</strong> {apt.reason}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:items-end">
        {isRequest ? (
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={() => handleAction(apt._id, "reject")} icon={XCircle}>
              Reject
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleAction(apt._id, "accept")} icon={CheckCircle}>
              Accept
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => navigate(`/doctor/appointments/${apt._id}`)} icon={Eye}>
            View Details
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <PageHeader title="Appointment Queue" description="Manage your pending requests and upcoming consultations." />

      <Section title="New Requests" description="Appointments waiting for your approval.">
        {requested.length > 0 ? (
          <div className="flex flex-col gap-4">
            {requested.map((apt) => (
              <AppointmentCard key={apt._id} apt={apt} isRequest={true} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 p-8 text-center text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No new appointment requests.
          </div>
        )}
      </Section>

      <Section title="Upcoming Appointments">
        {upcoming.length > 0 ? (
          <div className="flex flex-col gap-4">
            {upcoming.map((apt) => (
              <AppointmentCard key={apt._id} apt={apt} isRequest={false} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarClock}
            title="Queue is empty"
            description="You don't have any confirmed upcoming appointments."
          />
        )}
      </Section>

      <ConfirmDialog
        isOpen={confirmModal.open}
        title={confirmModal.action === "accept" ? "Accept Appointment" : "Reject Appointment"}
        description={`Are you sure you want to ${confirmModal.action} this appointment?`}
        confirmLabel={confirmModal.action === "accept" ? "Accept" : "Reject"}
        isDestructive={confirmModal.action === "reject"}
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal({ open: false, id: null, action: null })}
        loading={loading}
      />
    </div>
  );
}
