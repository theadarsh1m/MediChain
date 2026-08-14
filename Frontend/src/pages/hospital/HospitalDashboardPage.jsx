import { useEffect, useState } from "react";
import {
  BriefcaseMedical,
  Activity,
  Users2,
  CalendarDays,
  Building2,
  Plus,
  RefreshCw,
  Edit2,
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileBarChart2,
  ChevronRight,
  UserPlus,
  Bed,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import Button from "../../components/ui/Button";
import UpdateBedsModal from "../../components/hospital/UpdateBedsModal";
import OnboardDoctorModal from "../../components/hospital/OnboardDoctorModal";
import AdmitPatientModal from "../../components/hospital/AdmitPatientModal";
import { useHospitalStore } from "../../store/hospitalStore";

export default function HospitalDashboardPage() {
  const [bedsModalOpen, setBedsModalOpen] = useState(false);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [admitModalOpen, setAdmitModalOpen] = useState(false);

  const {
    fetchProfile,
    fetchDashboard,
    profile,
    dashboard,
    loading,
    error,
  } = useHospitalStore();

  useEffect(() => {
    fetchProfile();
    fetchDashboard();
  }, [fetchProfile, fetchDashboard]);

  const handleRefresh = async () => {
    try {
      await Promise.all([fetchProfile(), fetchDashboard()]);
      toast.success("Hospital dashboard data refreshed!");
    } catch {
      toast.error("Failed to refresh dashboard data.");
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="space-y-6">
        <PageHeader title="Hospital Overview" subtitle="Loading administrative overview..." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <SkeletonLoader className="h-12 w-12 mb-4 rounded-2xl" />
              <SkeletonLoader className="h-4 w-24 mb-2" />
              <SkeletonLoader className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = dashboard?.metrics || {
    doctorsCount: 48,
    patientsCount: 1284,
    appointmentsCount: 126,
    departmentsCount: 12,
    bedCapacity: 150,
  };

  const todayAppointments = dashboard?.todayAppointments || [];
  const recentDoctors = dashboard?.recentDoctors || [];
  const recentPatients = dashboard?.recentPatients || [];
  const recentActivity = dashboard?.recentActivity || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {profile?.name || "Hospital Administration Portal"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Administrative & Operations Command Center • UID: <span className="font-mono font-semibold">{profile?.uid || "HOSP-001"}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={handleRefresh}
            className="text-xs"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setOnboardModalOpen(true)}
            className="text-xs"
          >
            Onboard Doctor
          </Button>
        </div>
      </div>

      {/* 4 Primary Metric Counters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Doctors"
          value={metrics.doctorsCount}
          icon={BriefcaseMedical}
          colorClass={{ bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" }}
          helper="Medical staff & specialists"
        />
        <StatCard
          label="Patients"
          value={metrics.patientsCount.toLocaleString()}
          icon={Users2}
          colorClass={{ bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" }}
          helper="Registered patient records"
        />
        <StatCard
          label="Appointments"
          value={metrics.appointmentsCount}
          icon={CalendarDays}
          colorClass={{ bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" }}
          helper="Total bookings across hospital"
        />
        <StatCard
          label="Departments"
          value={metrics.departmentsCount}
          icon={Building2}
          colorClass={{ bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" }}
          helper="Clinical specialty wings"
        />
      </div>

      {/* Main Grid: Left 2 Cols (Today's Appointments & Activity), Right 1 Col (Recent Registrations & Quick Actions) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today's Appointments Table */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Hospital Appointments</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Global appointment roster across departments and physicians for today.
                </p>
              </div>
              <Link
                to="/hospital/appointments"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-emerald-400 flex items-center gap-1"
              >
                All Appointments <ChevronRight size={14} />
              </Link>
            </div>

            {todayAppointments.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No Appointments Scheduled Today"
                description="There are no appointments scheduled across departments for today."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Patient</th>
                      <th className="px-4 py-3">Doctor</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {todayAppointments.map((apt) => (
                      <tr key={apt._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{apt.patient?.name || "Patient"}</p>
                          <span className="text-[10px] font-mono text-slate-400">{apt.patient?.uid || "PAT-XXX"}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                          {apt.doctor?.name ? `Dr. ${apt.doctor.name}` : "Unassigned"}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {apt.doctor?.specialization || "General Medicine"}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {apt.appointmentTime || "10:00 AM"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              apt.status === "Confirmed"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : apt.status === "In Progress"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                : apt.status === "Completed"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Hospital & Doctor Activity Feed */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Hospital & Doctor Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No activity logs recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{act.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">{act.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {act.badge}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(act.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col */}
        <div className="space-y-6">
          {/* Quick Operations Actions */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Operations & Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setOnboardModalOpen(true)}
                className="flex items-center justify-between w-full rounded-2xl border border-slate-100 p-3.5 hover:bg-slate-50 transition dark:border-slate-800 dark:hover:bg-slate-800/40 text-left"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Onboard Doctor</p>
                  <p className="text-[11px] text-slate-400">Add medical practitioner to roster</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                  <UserPlus size={16} />
                </div>
              </button>

              <button
                onClick={() => setAdmitModalOpen(true)}
                className="flex items-center justify-between w-full rounded-2xl border border-slate-100 p-3.5 hover:bg-slate-50 transition dark:border-slate-800 dark:hover:bg-slate-800/40 text-left"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Admit Patient</p>
                  <p className="text-[11px] text-slate-400">Register inpatient admission record</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
                  <Plus size={16} />
                </div>
              </button>

              <button
                onClick={() => setBedsModalOpen(true)}
                className="flex items-center justify-between w-full rounded-2xl border border-slate-100 p-3.5 hover:bg-slate-50 transition dark:border-slate-800 dark:hover:bg-slate-800/40 text-left"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Bed Capacity</p>
                  <p className="text-[11px] text-slate-400">{profile?.numberOfBeds || 100} Total beds allocated</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Bed size={16} />
                </div>
              </button>
            </div>
          </div>

          {/* Recent Registrations Card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recent Registrations</h2>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  New Doctors
                </span>
                <div className="space-y-2">
                  {recentDoctors.map((doc) => (
                    <div key={doc._id} className="flex items-center justify-between text-xs py-1">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">Dr. {doc.name}</p>
                        <p className="text-[11px] text-slate-400">{doc.specialization || "General Medicine"}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {doc.status || "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  New Patients
                </span>
                <div className="space-y-2">
                  {recentPatients.map((pat) => (
                    <div key={pat._id} className="flex items-center justify-between text-xs py-1">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{pat.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{pat.uid}</p>
                      </div>
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                        {pat.bloodGroup || "O+"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UpdateBedsModal
        isOpen={bedsModalOpen}
        onClose={() => setBedsModalOpen(false)}
        currentBeds={profile?.numberOfBeds || 100}
      />
      <OnboardDoctorModal
        isOpen={onboardModalOpen}
        onClose={() => setOnboardModalOpen(false)}
      />
      <AdmitPatientModal
        isOpen={admitModalOpen}
        onClose={() => setAdmitModalOpen(false)}
      />
    </div>
  );
}
