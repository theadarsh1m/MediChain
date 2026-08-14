import { useEffect, useState } from "react";
import {
  Users2,
  Search,
  Plus,
  HeartPulse,
  ShieldAlert,
  Calendar,
  Building2,
  Phone,
  Mail,
  UserCheck,
  FileText,
  Bed,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import AdmitPatientModal from "../../components/hospital/AdmitPatientModal";
import { useHospitalStore } from "../../store/hospitalStore";

export default function HospitalPatientsPage() {
  const { patients, fetchPatients, loading, profile } = useHospitalStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewFilter, setViewFilter] = useState("all"); // "all" | "admitted"
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [selectedPatientForAdmission, setSelectedPatientForAdmission] = useState("");

  useEffect(() => {
    fetchPatients(searchTerm);
  }, [searchTerm, fetchPatients]);

  const handleOpenAdmit = (patientId = "") => {
    setSelectedPatientForAdmission(patientId);
    setAdmitModalOpen(true);
  };

  const filteredPatients = patients.filter((pat) => {
    const hospitalizations = pat.medicalHistory?.pastHospitalizations || [];
    const isAdmitted = hospitalizations.some(
      (h) =>
        h.hospitalName === profile?.name ||
        h.hospitalName?.toLowerCase() === profile?.name?.toLowerCase()
    );

    if (viewFilter === "admitted" && !isAdmitted) {
      return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = pat.name?.toLowerCase().includes(q);
      const matchEmail = pat.email?.toLowerCase().includes(q);
      const matchUID = pat.uid?.toLowerCase().includes(q);
      const matchPhone = pat.phone?.toLowerCase().includes(q);
      const matchBlood = pat.bloodGroup?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchUID && !matchPhone && !matchBlood) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Hospital Patients & Inpatient Records"
          description="Manage registered patients, hospitalizations, admissions, and treatment logs."
        />
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => handleOpenAdmit("")}
          className="self-start sm:self-center"
        >
          Admit Patient
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search patient by name, email, phone, or UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-sm"
          />
        </div>

        {/* View Tabs */}
        <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800 self-start md:self-auto">
          <button
            onClick={() => setViewFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              viewFilter === "all"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            All Patients ({patients.length})
          </button>
          <button
            onClick={() => setViewFilter("admitted")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              viewFilter === "admitted"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Admitted Inpatients
          </button>
        </div>
      </div>

      {/* Patients Grid */}
      {loading && patients.length === 0 ? (
        <Loader label="Loading hospital patient records..." />
      ) : filteredPatients.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No Patients Found"
          description={
            searchTerm
              ? `No patient records match "${searchTerm}".`
              : viewFilter === "admitted"
              ? "No patients have been admitted to this facility yet. Switch to 'All Patients' to admit a patient."
              : "No patients registered in the network."
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((pat) => {
            const hospitalizations = pat.medicalHistory?.pastHospitalizations || [];
            const hospitalRecord =
              hospitalizations.find(
                (h) =>
                  h.hospitalName === profile?.name ||
                  h.hospitalName?.toLowerCase() === profile?.name?.toLowerCase()
              ) || hospitalizations[0];

            const isAdmittedToThisHospital = hospitalizations.some(
              (h) =>
                h.hospitalName === profile?.name ||
                h.hospitalName?.toLowerCase() === profile?.name?.toLowerCase()
            );

            return (
              <div
                key={pat._id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center font-bold text-purple-700 dark:text-purple-300 overflow-hidden border border-purple-200 dark:border-purple-500/30">
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

                    {pat.bloodGroup && (
                      <span className="shrink-0 rounded-lg bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                        {pat.bloodGroup}
                      </span>
                    )}
                  </div>

                  {/* Vitals & Admission Details */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span>UID:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{pat.uid}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Gender / Age:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {pat.gender || "N/A"} • {pat.dob ? `${new Date().getFullYear() - new Date(pat.dob).getFullYear()} yrs` : "N/A"}
                      </span>
                    </div>

                    {hospitalRecord ? (
                      <div className="rounded-xl bg-purple-50/60 p-2.5 text-xs dark:bg-purple-950/30">
                        <p className="font-bold text-purple-900 dark:text-purple-200">
                          Stay: {hospitalRecord.reason || "General Admission"}
                        </p>
                        <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80 mt-0.5">
                          Facility: {hospitalRecord.hospitalName || "Inpatient Ward"} • {hospitalRecord.duration || "Admitted"}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 dark:bg-slate-800/40">
                        No active hospitalization recorded.
                      </div>
                    )}

                    {pat.emergencyContact?.name && (
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Emergency:</span>
                        <span>{pat.emergencyContact.name} ({pat.emergencyContact.phone})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer and Actions */}
                <div className="pt-3 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 truncate max-w-[140px]">
                    <Phone size={12} /> {pat.phone || "No phone"}
                  </span>

                  <Button
                    variant={isAdmittedToThisHospital ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleOpenAdmit(pat._id)}
                    className="text-[11px] py-1 px-2.5 h-auto"
                    icon={Bed}
                  >
                    {isAdmittedToThisHospital ? "Add Stay" : "Admit"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admit Patient Modal */}
      <AdmitPatientModal
        isOpen={admitModalOpen}
        onClose={() => {
          setAdmitModalOpen(false);
          setSelectedPatientForAdmission("");
        }}
        defaultPatientId={selectedPatientForAdmission}
        onPatientAdmitted={() => fetchPatients(searchTerm)}
      />
    </div>
  );
}
