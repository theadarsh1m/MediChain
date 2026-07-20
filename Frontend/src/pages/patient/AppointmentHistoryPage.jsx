import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CalendarClock, Download, Plus, XCircle } from "lucide-react";

import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";
import PageHeader from "../../components/ui/PageHeader";
import Section from "../../components/ui/Section";
import { useAppointmentStore } from "../../store/appointmentStore";

export default function AppointmentHistoryPage() {
  const { appointments, fetchAppointments, updateStatus, loading } = useAppointmentStore();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancelClick = (id) => {
    setSelectedAptId(id);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    try {
      await updateStatus(selectedAptId, "Cancelled");
      toast.success("Appointment cancelled.");
      setCancelModalOpen(false);
      setSelectedAptId(null);
    } catch (error) {
      toast.error(error.message || "Failed to cancel appointment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Requested":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300";
      case "Confirmed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300";
      case "Rescheduled":
        return "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300";
      case "Completed":
        return "bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-rose-500/20 dark:text-rose-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300";
    }
  };

  if (loading && appointments.length === 0) {
    return <Loader label="Loading your appointments..." />;
  }

  const upcoming = appointments.filter(
    (a) => ["Requested", "Pending", "Confirmed", "Rescheduled"].includes(a.status)
  );
  const past = appointments.filter((a) => ["Completed", "Cancelled"].includes(a.status));

  const AppointmentCard = ({ apt, isUpcoming }) => (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(apt.status)}`}>
            {apt.status}
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Dr. {apt.doctor?.name} <span className="text-sm font-normal text-slate-500">({apt.doctor?.specialization})</span>
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong>Hospital:</strong> {apt.hospital?.name}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong>Reason:</strong> {apt.reason}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:items-end">
        {isUpcoming && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleCancelClick(apt._id)}
            className="w-full sm:w-auto"
            icon={XCircle}
          >
            Cancel
          </Button>
        )}
        {apt.status === "Completed" && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            icon={Download}
            onClick={() => toast.success("Summary downloaded (Mock)")}
          >
            Summary
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Appointments" description="Manage your upcoming and past visits." />
        <Link to="/patient/appointments/book">
          <Button icon={Plus}>Book Appointment</Button>
        </Link>
      </div>

      <Section title="Upcoming Appointments">
        {upcoming.length > 0 ? (
          <div className="flex flex-col gap-4">
            {upcoming.map((apt) => (
              <AppointmentCard key={apt._id} apt={apt} isUpcoming={true} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarClock}
            title="No upcoming appointments"
            description="You don't have any scheduled visits right now."
            action={{ label: "Book Now", onClick: () => document.querySelector("a[href='/patient/appointments/book']").click() }}
          />
        )}
      </Section>

      <Section title="Past Appointments">
        {past.length > 0 ? (
          <div className="flex flex-col gap-4">
            {past.map((apt) => (
              <AppointmentCard key={apt._id} apt={apt} isUpcoming={false} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 p-8 text-center text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No past appointments found.
          </div>
        )}
      </Section>

      <ConfirmDialog
        isOpen={cancelModalOpen}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        isDestructive={true}
        onConfirm={confirmCancel}
        onCancel={() => {
          setCancelModalOpen(false);
          setSelectedAptId(null);
        }}
        loading={loading}
      />
    </div>
  );
}
