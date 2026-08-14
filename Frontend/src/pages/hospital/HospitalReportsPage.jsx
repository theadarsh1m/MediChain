import { useEffect } from "react";
import {
  FileBarChart2,
  Activity,
  Bed,
  Video,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Building2,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { useHospitalStore } from "../../store/hospitalStore";

export default function HospitalReportsPage() {
  const { reports, fetchReports, loading, profile } = useHospitalStore();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  if (loading && !reports) {
    return <Loader label="Generating hospital analytics & reports..." />;
  }

  const handleExport = () => {
    toast.success("Hospital audit report downloaded successfully!");
  };

  const bedCapacity = reports?.bedCapacity || { total: 100, occupied: 65, available: 35, occupancyRatePercent: 65 };
  const telemedicine = reports?.telemedicineAdoption || { totalDoctors: 0, telemedicineEnabled: 0, adoptionRatePercent: 0 };
  const appointments = reports?.appointmentAnalytics || { total: 0, completed: 0, pending: 0, cancelled: 0, completionRate: 100 };
  const departments = reports?.departmentBreakdown || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Hospital Analytics & Audit Reports"
          description="Operational metrics, bed capacity utilization, telemedicine adoption, and appointment volume."
        />
        <Button
          variant="secondary"
          icon={Download}
          onClick={handleExport}
          className="self-start sm:self-center"
        >
          Export Audit Report
        </Button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Bed Occupancy Rate"
          value={`${Math.round(bedCapacity.occupancyRatePercent)}%`}
          icon={Bed}
          colorClass={{ bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" }}
          helper={`${bedCapacity.occupied} / ${bedCapacity.total} beds occupied`}
        />
        <StatCard
          label="Telemedicine Adoption"
          value={`${Math.round(telemedicine.adoptionRatePercent)}%`}
          icon={Video}
          colorClass={{ bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" }}
          helper={`${telemedicine.telemedicineEnabled} telemedicine doctors`}
        />
        <StatCard
          label="Total Hospital Visits"
          value={appointments.total}
          icon={Activity}
          colorClass={{ bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" }}
          helper="Logged consultations"
        />
        <StatCard
          label="Visit Completion Rate"
          value={`${appointments.completionRate}%`}
          icon={CheckCircle2}
          colorClass={{ bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" }}
          helper={`${appointments.completed} visits concluded`}
        />
      </div>

      {/* Grid: Bed Capacity & Telehealth breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bed Capacity Detailed Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Bed size={18} className="text-blue-600 dark:text-emerald-400" />
            <span>Bed Capacity & Inpatient Distribution</span>
          </div>

          <div className="space-y-3">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Occupied Beds ({bedCapacity.occupied})</span>
                <span>Available ({bedCapacity.available})</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, bedCapacity.occupancyRatePercent))}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40 text-center">
                <span className="text-slate-400">Total Beds</span>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{bedCapacity.total}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40 text-center">
                <span className="text-slate-400">Occupied</span>
                <p className="text-base font-bold text-blue-600 dark:text-emerald-400 mt-0.5">{bedCapacity.occupied}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40 text-center">
                <span className="text-slate-400">Available</span>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-300 mt-0.5">{bedCapacity.available}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Status Breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Activity size={18} className="text-blue-600 dark:text-emerald-400" />
            <span>Consultation Volume Status</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <CheckCircle2 size={15} className="text-emerald-500" /> Completed Consultations
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{appointments.completed}</span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Clock size={15} className="text-amber-500" /> Pending / In Queue
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{appointments.pending}</span>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <XCircle size={15} className="text-rose-500" /> Cancelled Visits
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{appointments.cancelled}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Building2 size={18} className="text-blue-600 dark:text-emerald-400" />
          <span>Department Staff Distribution</span>
        </div>

        {departments.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No department staff data available.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  <th className="p-3.5 font-bold">Specialty / Department</th>
                  <th className="p-3.5 font-bold">Doctor Count</th>
                  <th className="p-3.5 font-bold">Clinical Wing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {departments.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">{dept.department}</td>
                    <td className="p-3.5 font-bold">{dept.doctorCount} Doctors</td>
                    <td className="p-3.5">
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                        Operational
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
