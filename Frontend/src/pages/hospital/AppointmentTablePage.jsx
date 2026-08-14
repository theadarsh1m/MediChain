import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Filter,
  Search,
  XCircle,
  Calendar,
  Clock,
  Building2,
  Users2,
  Stethoscope,
  UserCheck,
  Eye,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Loader from "../../components/ui/Loader";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import StatCard from "../../components/ui/StatCard";
import ReassignDoctorModal from "../../components/hospital/ReassignDoctorModal";
import { useHospitalStore } from "../../store/hospitalStore";

export default function AppointmentTablePage() {
  const { appointments, fetchAppointments, cancelAppointment, loading } = useHospitalStore();

  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [cancelModal, setCancelModal] = useState({ open: false, id: null });
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [targetAppointment, setTargetAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments(search, departmentFilter, statusFilter);
  }, [search, departmentFilter, statusFilter, fetchAppointments]);

  const handleCancelClick = (id) => {
    setCancelModal({ open: true, id });
  };

  const confirmCancel = async () => {
    try {
      await cancelAppointment(cancelModal.id, "Administrative cancellation by Hospital Operations");
      toast.success("Appointment cancelled by hospital admin.");
      setCancelModal({ open: false, id: null });
    } catch (error) {
      toast.error(error.message || "Failed to cancel appointment");
    }
  };

  const handleReassignClick = (apt) => {
    setTargetAppointment(apt);
    setReassignModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Requested":
        return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300";
      case "Pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300";
      case "Confirmed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300";
      case "In Progress":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300";
      case "Completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const stats = {
    total: appointments.length,
    today: appointments.filter(
      (a) => new Date(a.appointmentDate).toISOString().split("T")[0] === new Date().toISOString().split("T")[0]
    ).length,
    pending: appointments.filter((a) => ["Requested", "Pending"].includes(a.status)).length,
    confirmed: appointments.filter((a) => a.status === "Confirmed").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Hospital Appointments Roster"
        description="Master administrative schedule across all clinical specialties, doctor assignments, and visit statuses."
      />

      {/* KPI Counters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={stats.total}
          icon={Calendar}
          colorClass={{ bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" }}
          helper="All recorded visits"
        />
        <StatCard
          label="Today's Visits"
          value={stats.today}
          icon={Clock}
          colorClass={{ bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" }}
          helper="Scheduled for today"
        />
        <StatCard
          label="Confirmed Schedule"
          value={stats.confirmed}
          icon={CheckCircle2}
          colorClass={{ bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" }}
          helper="Active bookings"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pending}
          icon={RotateCcw}
          colorClass={{ bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" }}
          helper="Awaiting confirmation"
        />
      </div>

      {/* Table & Controls Section */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search patient, doctor, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Department Filter */}
            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400">Dept:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="ENT">ENT</option>
                <option value="Dermatology">Dermatology</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Requested">Requested</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global Master Appointments Table */}
        {loading && appointments.length === 0 ? (
          <Loader label="Loading global appointments..." />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Appointments Found"
            description={
              search
                ? `No appointment records match "${search}".`
                : "No appointments found matching the selected filters."
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Doctor</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Time / Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{apt.patient?.name || "Patient"}</p>
                      <span className="text-[10px] font-mono text-slate-400">{apt.patient?.uid || "PAT-XXX"}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {apt.doctor?.name ? `Dr. ${apt.doctor.name}` : "Unassigned"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {apt.doctor?.department || apt.doctor?.specialization || "General Medicine"}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {apt.appointmentTime || "10:00 AM"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {apt.status !== "Completed" && apt.status !== "Cancelled" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-[11px] py-1 px-2.5"
                              icon={UserCheck}
                              onClick={() => handleReassignClick(apt)}
                              title="Reassign Doctor"
                            >
                              Reassign
                            </Button>
                            <button
                              onClick={() => handleCancelClick(apt._id)}
                              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Cancel Appointment"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reassign Doctor Modal */}
      <ReassignDoctorModal
        isOpen={reassignModalOpen}
        onClose={() => {
          setReassignModalOpen(false);
          setTargetAppointment(null);
        }}
        appointment={targetAppointment}
      />

      {/* Cancel Dialog */}
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
