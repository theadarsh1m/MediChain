import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Filter, Search, XCircle } from "lucide-react";

import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Loader from "../../components/ui/Loader";
import PageHeader from "../../components/ui/PageHeader";
import Section from "../../components/ui/Section";
import StatCard from "../../components/ui/StatCard";
import { useAppointmentStore } from "../../store/appointmentStore";

export default function AppointmentTablePage() {
  const { appointments, fetchAppointments, updateStatus, loading } = useAppointmentStore();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [cancelModal, setCancelModal] = useState({ open: false, id: null });

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancelClick = (id) => {
    setCancelModal({ open: true, id });
  };

  const confirmCancel = async () => {
    try {
      await updateStatus(cancelModal.id, "Cancelled");
      toast.success("Appointment cancelled by hospital admin.");
      setCancelModal({ open: false, id: null });
    } catch (error) {
      toast.error(error.message || "Failed to cancel appointment");
    }
  };

  if (loading && appointments.length === 0) {
    return <Loader label="Loading hospital appointments..." />;
  }

  const filteredAppointments = appointments.filter((apt) => {
    const matchesFilter = filter === "All" || apt.status === filter;
    const matchesSearch =
      apt.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctor?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Requested": return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300";
      case "Pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300";
      case "Confirmed": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300";
      case "Completed": return "bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300";
      case "Cancelled": return "bg-red-100 text-red-800 dark:bg-rose-500/20 dark:text-rose-300";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const stats = {
    total: appointments.length,
    today: appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length,
    pending: appointments.filter(a => a.status === "Requested" || a.status === "Pending").length,
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Appointments Management" description="Overview and administration of all hospital appointments." />

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard title="Total Appointments" value={stats.total} />
        <StatCard title="Today's Visits" value={stats.today} />
        <StatCard title="Pending Requests" value={stats.pending} />
      </div>

      <Section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search patient or doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="All">All Statuses</option>
              <option value="Requested">Requested</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 text-slate-900 dark:bg-slate-900/50 dark:text-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Doctor</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <tr key={apt._id} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{apt.patient?.name}</p>
                      <p className="text-xs text-slate-500">{apt.patient?.uid}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-slate-100">Dr. {apt.doctor?.name}</p>
                      <p className="text-xs text-slate-500">{apt.doctor?.specialization}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p>{new Date(apt.appointmentDate).toLocaleDateString()}</p>
                      <p className="text-xs">{apt.appointmentTime}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {["Requested", "Pending", "Confirmed", "Rescheduled"].includes(apt.status) && (
                        <button
                          onClick={() => handleCancelClick(apt._id)}
                          className="text-red-500 hover:text-red-700 dark:text-rose-400 dark:hover:text-rose-300 transition"
                          title="Cancel Appointment"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No appointments found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <ConfirmDialog
        isOpen={cancelModal.open}
        title="Admin Cancel Appointment"
        description="Are you sure you want to cancel this appointment on behalf of the hospital? This action is irreversible."
        confirmLabel="Yes, Cancel"
        isDestructive={true}
        onConfirm={confirmCancel}
        onCancel={() => setCancelModal({ open: false, id: null })}
        loading={loading}
      />
    </div>
  );
}
