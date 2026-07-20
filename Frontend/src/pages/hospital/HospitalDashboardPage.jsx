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
  FileBarChart2
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import SkeletonLoader from "../../components/ui/SkeletonLoader";
import UpdateBedsModal from "../../components/hospital/UpdateBedsModal";
import { useHospitalStore } from "../../store/hospitalStore";

export default function HospitalDashboardPage() {
  const [bedsModalOpen, setBedsModalOpen] = useState(false);
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
      toast.success("Dashboard data refreshed!");
    } catch {
      toast.error("Failed to refresh dashboard data.");
    }
  };

  const handleAddDoctorToast = () => {
    toast.error("Add Doctor interface is currently under development in the Doctors tab.");
  };

  if (loading && !dashboard) {
    return (
      <div className="space-y-6">
        <PageHeader title="Hospital Overview" subtitle="Overview of hospital metrics and activities." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <SkeletonLoader className="h-12 w-12 mb-4" />
              <SkeletonLoader className="h-4 w-24 mb-2" />
              <SkeletonLoader className="h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 h-64 animate-pulse" />
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 h-64 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 h-64 animate-pulse" />
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <ErrorState
        title="Unable to load dashboard"
        message={error}
        onRetry={handleRefresh}
      />
    );
  }

  const upcomingAppointments = dashboard?.upcomingAppointments || 0;
  const recentActivity = dashboard?.recentActivity || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Hospital Overview"
          subtitle={`Welcome back, ${profile?.name || "Hospital Administrator"}. Here's what's happening today.`}
        />
        <button
          onClick={handleRefresh}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 self-start sm:self-center"
        >
          <RefreshCw size={14} />
          Refresh Stats
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Doctors"
          value={dashboard?.totalDoctors ?? 0}
          icon={BriefcaseMedical}
          colorClass={{ bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" }}
          helper="Onboarded practitioners"
        />
        <StatCard
          label="Active Doctors"
          value={dashboard?.activeDoctors ?? 0}
          icon={Activity}
          colorClass={{ bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" }}
          helper="On duty & online"
        />
        <StatCard
          label="Total Patients"
          value={dashboard?.totalPatients ?? 0}
          icon={Users2}
          colorClass={{ bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" }}
          helper="Registered record profiles"
        />
        <StatCard
          label="Total Appointments"
          value={dashboard?.totalAppointments ?? 0}
          icon={CalendarDays}
          colorClass={{ bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" }}
          helper="Booked/completed count"
        />
        <StatCard
          label="Departments"
          value={dashboard?.departments?.length ?? 0}
          icon={Building2}
          colorClass={{ bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" }}
          helper="Active specialties"
        />
      </div>

      {/* Main Widgets Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column - Activity Feed & Appointments */}
        <div className="md:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Upcoming Appointments
            </h2>
            {upcomingAppointments === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Upcoming Appointments"
                description="There are currently no upcoming appointments scheduled in this system."
              />
            ) : (
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 text-center bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  {upcomingAppointments} Scheduled Appointments
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Check the Appointments page to view details or schedules.
                </p>
              </div>
            )}
          </div>

          {/* Recent Activity Feed */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Recent Activity Feed
            </h2>
            {recentActivity.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                title="No Recent Activity"
                description="No patient admissions or doctor signups have been recorded yet."
              />
            ) : (
              <div className="relative border-l border-slate-100 dark:border-slate-800 pl-4 ml-2 space-y-6">
                {recentActivity.map((act, index) => (
                  <div key={index} className="relative">
                    <span className="absolute -left-[21px] top-1.5 flex h-2 w-2 rounded-full bg-blue-500 dark:bg-emerald-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {act.message}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(act.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Quick Actions & Hospital Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid gap-3">
              <button
                onClick={handleAddDoctorToast}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 hover:bg-slate-50/50 hover:shadow-sm transition dark:border-slate-800 dark:hover:bg-slate-800/40 text-left w-full"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Onboard Doctor
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    Register a new practitioner
                  </p>
                </div>
                <div className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Plus size={16} />
                </div>
              </button>

              <button
                onClick={() => setBedsModalOpen(true)}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 hover:bg-slate-50/50 hover:shadow-sm transition dark:border-slate-800 dark:hover:bg-slate-800/40 text-left w-full"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Update Bed Count
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    Configure capacity stats
                  </p>
                </div>
                <div className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Edit2 size={16} />
                </div>
              </button>

              <Link
                to="/hospital/reports"
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 hover:bg-slate-50/50 hover:shadow-sm transition dark:border-slate-800 dark:hover:bg-slate-800/40 text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Hospital Analytics
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    Inspect hospital records
                  </p>
                </div>
                <div className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <FileBarChart2 size={16} />
                </div>
              </Link>
            </div>
          </div>

          {/* Hospital Information */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Hospital Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-slate-400 dark:text-slate-500 mt-0.5" size={16} />
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Address</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                    {profile?.address || "Address not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="text-slate-400 dark:text-slate-500 mt-0.5" size={16} />
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Phone</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                    {profile?.contactNumber || "Contact not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="text-slate-400 dark:text-slate-500 mt-0.5" size={16} />
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Email</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                    {profile?.email || "Email not configured"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="text-slate-400 dark:text-slate-500 mt-0.5" size={16} />
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Bed Capacity</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                    {profile?.numberOfBeds ?? 0} Beds Registered
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpdateBedsModal
        isOpen={bedsModalOpen}
        onClose={() => setBedsModalOpen(false)}
        currentBeds={profile?.numberOfBeds}
      />
    </div>
  );
}
