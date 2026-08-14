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
  Search,
  CheckCircle2,
  Sparkles,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import { useHospitalStore } from "../../store/hospitalStore";

const deptIcons = {
  Cardiology: Heart,
  Neurology: Brain,
  Orthopedics: Bone,
  Pediatrics: Baby,
  ENT: Activity,
  Dermatology: Sparkles,
  Radiology: Radiation,
  "Emergency Care": Flame,
  "General Medicine": Stethoscope,
  Oncology: Activity,
};

export default function HospitalDepartmentsPage() {
  const { departments, fetchDepartments, profile, loading } = useHospitalStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  if (loading && departments.length === 0) {
    return <Loader label="Loading hospital clinical departments..." />;
  }

  const totalDoctors = departments.reduce((acc, d) => acc + (d.doctors?.length || 0), 0);
  const totalBeds = profile?.numberOfBeds || 100;

  const filtered = departments.filter((d) => {
    const name = d.name || d.department || "";
    const desc = d.description || "";
    const head = d.headDoctor || "";
    const q = searchTerm.toLowerCase();
    return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || head.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Clinical Wings & Department Management"
          description="Control specialty departments (Cardiology, Neurology, Orthopedics, Pediatrics, ENT, Dermatology), assign department heads, and manage bed allocations."
        />

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search department or head doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-sm"
          />
        </div>
      </div>

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
          label="Facility Bed Capacity"
          value={totalBeds}
          icon={Bed}
          colorClass={{ bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" }}
          helper="Distributed clinical ward beds"
        />
      </div>

      {/* Departments Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((dept) => {
          const deptName = dept.name || dept.department || "Specialty";
          const Icon = deptIcons[deptName] || Building2;
          const docCount = dept.doctors?.length || 0;

          return (
            <div
              key={deptName}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 text-blue-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {deptName}
                      </h3>
                      <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                        {dept.activeStatus || "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                  {dept.description || `${deptName} clinical and diagnostic specialty wing.`}
                </p>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Head Doctor:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                      {dept.headDoctor || "Dr. Chief Physician"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Doctors on Duty:</span>
                    <span className="font-bold text-blue-700 dark:text-emerald-400">{docCount} Specialists</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bed Allocation:</span>
                    <span className="font-bold text-purple-700 dark:text-purple-300">{dept.bedAllocation || 12} Beds</span>
                  </div>
                </div>

                {/* Staff Roster */}
                <div className="pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Doctor Roster</p>
                  {docCount > 0 ? (
                    <div className="space-y-1">
                      {dept.doctors.slice(0, 3).map((d) => (
                        <p key={d._id} className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          • Dr. {d.name} ({d.status || "Active"})
                        </p>
                      ))}
                      {docCount > 3 && (
                        <p className="text-[10px] text-slate-400">+{docCount - 3} more practitioners</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No doctors assigned yet.</p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2">
                <Link to="/hospital/doctors">
                  <Button size="sm" variant="secondary" className="w-full text-xs" icon={Eye}>
                    Manage Department Doctors
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
