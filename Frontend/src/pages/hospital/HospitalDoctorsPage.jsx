import { useEffect, useState } from "react";
import {
  BriefcaseMedical,
  Search,
  Plus,
  Building2,
  Calendar,
  Users2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  ShieldAlert,
  Edit3,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import OnboardDoctorModal from "../../components/hospital/OnboardDoctorModal";
import AssignDepartmentModal from "../../components/hospital/AssignDepartmentModal";
import DoctorAvailabilityModal from "../../components/hospital/DoctorAvailabilityModal";
import { useHospitalStore } from "../../store/hospitalStore";

export default function HospitalDoctorsPage() {
  const { doctors, fetchDoctors, updateDoctorStatus, loading } = useHospitalStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // "All" | "Active" | "Suspended"

  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [assignDeptModalOpen, setAssignDeptModalOpen] = useState(false);
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors(searchTerm, departmentFilter);
  }, [searchTerm, departmentFilter, fetchDoctors]);

  const handleStatusToggle = async (doc) => {
    const nextStatus = doc.status === "Active" ? "Suspended" : "Active";
    try {
      await updateDoctorStatus(doc._id, nextStatus);
      toast.success(`Dr. ${doc.name} status changed to ${nextStatus}.`);
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  const handleOpenAssignDept = (doc) => {
    setSelectedDoctor(doc);
    setAssignDeptModalOpen(true);
  };

  const handleOpenAvailability = (doc) => {
    setSelectedDoctor(doc);
    setAvailabilityModalOpen(true);
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (statusFilter !== "All" && doc.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Doctor Management & Staff Roster"
          description="Manage hospital doctors, assign departments, review workloads, approve or suspend practitioners."
        />

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setOnboardModalOpen(true)}
          className="text-xs self-start sm:self-center"
        >
          Onboard New Doctor
        </Button>
      </div>

      {/* Controls: Search, Department Filter, Status Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search doctors by name, license, UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Select */}
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
              <option value="Emergency Care">Emergency Care</option>
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            {["All", "Active", "Suspended"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition ${
                  statusFilter === st
                    ? "bg-blue-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading && doctors.length === 0 ? (
        <Loader label="Loading doctor roster..." />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          icon={BriefcaseMedical}
          title="No Doctors Found"
          description={
            searchTerm
              ? `No doctors match "${searchTerm}".`
              : "No doctor records match the selected filters."
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doc) => {
            const isActive = doc.status === "Active";
            return (
              <div
                key={doc._id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  {/* Doctor Card Top */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-100 dark:bg-emerald-500/20 flex items-center justify-center font-bold text-blue-700 dark:text-emerald-300 text-base border border-blue-200 dark:border-emerald-500/30 overflow-hidden">
                        {doc.profilePic ? (
                          <img src={doc.profilePic} alt={doc.name} className="h-full w-full object-cover" />
                        ) : (
                          doc.name?.charAt(0) || "D"
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                          Dr. {doc.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{doc.email}</p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                      }`}
                    >
                      {doc.status || "Active"}
                    </span>
                  </div>

                  {/* Doctor Stats & Department Table Row */}
                  <div className="space-y-2 text-xs pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Department:</span>
                      <span className="font-bold text-blue-700 dark:text-emerald-400">
                        {doc.department || doc.specialization || "General Medicine"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Appointments Today:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {doc.appointmentsTodayCount || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Total Patients:</span>
                      <span className="font-bold text-purple-700 dark:text-purple-300">
                        {doc.totalPatients || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Hospital:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                        {doc.hospital || "MediVault Network"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-4 mt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Edit3}
                    className="flex-1 text-xs"
                    onClick={() => handleOpenAssignDept(doc)}
                  >
                    Assign Dept
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Eye}
                    className="flex-1 text-xs"
                    onClick={() => handleOpenAvailability(doc)}
                  >
                    Availability
                  </Button>

                  <Button
                    size="sm"
                    variant={isActive ? "danger" : "primary"}
                    className="text-xs px-2.5"
                    onClick={() => handleStatusToggle(doc)}
                  >
                    {isActive ? "Suspend" : "Activate"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <OnboardDoctorModal
        isOpen={onboardModalOpen}
        onClose={() => setOnboardModalOpen(false)}
      />

      <AssignDepartmentModal
        isOpen={assignDeptModalOpen}
        onClose={() => {
          setAssignDeptModalOpen(false);
          setSelectedDoctor(null);
        }}
        doctor={selectedDoctor}
      />

      <DoctorAvailabilityModal
        isOpen={availabilityModalOpen}
        onClose={() => {
          setAvailabilityModalOpen(false);
          setSelectedDoctor(null);
        }}
        doctor={selectedDoctor}
      />
    </div>
  );
}
