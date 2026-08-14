import { useEffect, useState } from "react";
import {
  Building2,
  Users2,
  Bed,
  Stethoscope,
  Activity,
  Heart,
  Brain,
  Bone,
  Baby,
  Radiation,
  Flame,
  ShieldCheck,
} from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Loader from "../../components/ui/Loader";
import { useHospitalStore } from "../../store/hospitalStore";

const deptIcons = {
  Cardiology: Heart,
  Neurology: Brain,
  Orthopedics: Bone,
  Pediatrics: Baby,
  Radiology: Radiation,
  "Emergency Care": Flame,
  "General Medicine": Stethoscope,
  Oncology: Activity,
};

export default function HospitalDepartmentsPage() {
  const { departments, fetchDepartments, profile, loading } = useHospitalStore();

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  if (loading && departments.length === 0) {
    return <Loader label="Loading hospital departments..." />;
  }

  const totalDoctors = departments.reduce((acc, d) => acc + (d.doctors?.length || 0), 0);
  const totalBeds = profile?.numberOfBeds || 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital Specialties & Departments"
        description="Overview of clinical departments, medical specialists, and ward bed allocations."
      />

      {/* Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active Specialties"
          value={departments.length}
          icon={Building2}
          colorClass={{ bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" }}
          helper="Operational hospital wings"
        />
        <StatCard
          label="Assigned Doctors"
          value={totalDoctors}
          icon={Stethoscope}
          colorClass={{ bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" }}
          helper="Across all clinical wards"
        />
        <StatCard
          label="Total Facility Beds"
          value={totalBeds}
          icon={Activity}
          colorClass={{ bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" }}
          helper="Distributed capacity"
        />
      </div>

      {/* Departments Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => {
          const Icon = deptIcons[dept.department] || Building2;
          const docCount = dept.doctors?.length || 0;

          return (
            <div
              key={dept.department}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 text-blue-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                    {dept.department}
                  </h3>
                  <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    Active Wing
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span>Assigned Doctors:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{docCount} Practitioners</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Bed Allocation:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{dept.bedAllocation || 12} Beds</span>
                </div>
              </div>

              {/* Staff preview */}
              <div className="pt-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Staff Roster</p>
                {docCount > 0 ? (
                  <div className="space-y-1">
                    {dept.doctors.slice(0, 2).map((d) => (
                      <p key={d._id} className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        • Dr. {d.name} ({d.experience ? `${d.experience}y exp` : "Consultant"})
                      </p>
                    ))}
                    {docCount > 2 && (
                      <p className="text-[10px] text-slate-400">+{docCount - 2} more doctors</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No doctors currently assigned.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
