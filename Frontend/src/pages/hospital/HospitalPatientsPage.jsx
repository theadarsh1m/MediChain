import { useEffect, useState } from "react";
import {
  Users2,
  Search,
  Plus,
  Building2,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  Bed,
  CheckCircle,
  Eye,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import AdmitPatientModal from "../../components/hospital/AdmitPatientModal";
import PatientAdminProfileModal from "../../components/hospital/PatientAdminProfileModal";
import { useHospitalStore } from "../../store/hospitalStore";

export default function HospitalPatientsPage() {
  const { patients, fetchPatients, loading } = useHospitalStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all" | "admitted"
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prefilledPatientId, setPrefilledPatientId] = useState(null);

  useEffect(() => {
    fetchPatients(searchTerm, filterTab);
  }, [searchTerm, filterTab, fetchPatients]);

  const handleOpenAdmit = (patientId = null) => {
    setPrefilledPatientId(patientId);
    setAdmitModalOpen(true);
  };

  const handleOpenProfile = (patient) => {
    setSelectedDoctorPatient(patient);
  };

  const setSelectedDoctorPatient = (patient) => {
    setSelectedPatient(patient);
    setProfileModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Patient Administration Directory"
          description="Administrative oversight of hospital patients, demographic files, admission stays, and physician assignments."
        />

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => handleOpenAdmit(null)}
          className="text-xs self-start sm:self-center"
        >
          Admit Patient
        </Button>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search patients by name, UID, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-sm"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <button
            onClick={() => setFilterTab("all")}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
              filterTab === "all"
                ? "bg-blue-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            All Patients
          </button>
          <button
            onClick={() => setFilterTab("admitted")}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
              filterTab === "admitted"
                ? "bg-blue-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            Admitted Inpatients
          </button>
        </div>
      </div>

      {/* Patient Cards */}
      {loading && patients.length === 0 ? (
        <Loader label="Loading patient directory..." />
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No Patients Found"
          description={
            searchTerm
              ? `No patient records match "${searchTerm}".`
              : "No patient records match the selected category."
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((pat) => (
            <div
              key={pat._id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                {/* Top Info */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center font-bold text-purple-700 dark:text-purple-300 text-base border border-purple-200 dark:border-purple-800/40 overflow-hidden">
                      {pat.profilePic ? (
                        <img src={pat.profilePic} alt={pat.name} className="h-full w-full object-cover" />
                      ) : (
                        pat.name?.charAt(0) || "P"
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                        {pat.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{pat.email}</p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-lg bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                    {pat.bloodGroup || "O+"}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">UID:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{pat.uid}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Gender / Age:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {pat.gender || "Male"} • {pat.dob ? `${new Date().getFullYear() - new Date(pat.dob).getFullYear()} yrs` : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Assigned Doctor:</span>
                    <span className="font-semibold text-blue-600 dark:text-emerald-400 truncate max-w-[150px]">
                      {pat.assignedDoctor || "General OPD"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Appointments:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {pat.appointmentCount || 0} visits
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-4 mt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Eye}
                  className="flex-1 text-xs"
                  onClick={() => setSelectedDoctorPatient(pat)}
                >
                  Admin Profile
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Bed}
                  className="flex-1 text-xs"
                  onClick={() => handleOpenAdmit(pat._id)}
                >
                  Admit Patient
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AdmitPatientModal
        isOpen={admitModalOpen}
        onClose={() => {
          setAdmitModalOpen(false);
          setPrefilledPatientId(null);
        }}
        defaultPatientId={prefilledPatientId}
      />

      <PatientAdminProfileModal
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
      />
    </div>
  );
}
