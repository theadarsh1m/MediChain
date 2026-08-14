import { useEffect, useState } from "react";
import {
  Users2,
  Search,
  FileText,
  Pill,
  ShieldAlert,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  Activity,
  HeartPulse,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import PatientDossierModal from "../../components/doctor/PatientDossierModal";
import QuickPrescriptionModal from "../../components/doctor/QuickPrescriptionModal";
import { useDoctorStore } from "../../store/doctorStore";

export default function DoctorPatientsPage() {
  const { patients, fetchPatients, loading } = useDoctorStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDossierPatientId, setSelectedDossierPatientId] = useState(null);
  const [rxTargetPatient, setRxTargetPatient] = useState(null);
  const [rxModalOpen, setRxModalOpen] = useState(false);

  useEffect(() => {
    fetchPatients(searchTerm);
  }, [searchTerm, fetchPatients]);

  const openRx = (patient) => {
    setRxTargetPatient(patient);
    setRxModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Patient EHR Directory"
          description="Browse and inspect complete medical dossiers, allergies, histories, and prescriptions."
        />

        {/* Search Bar */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, or UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-sm"
          />
        </div>
      </div>

      {loading && patients.length === 0 ? (
        <Loader label="Loading patient directory..." />
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No Patients Found"
          description={
            searchTerm
              ? `No patient records match "${searchTerm}".`
              : "No patient records available yet."
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
                {/* Patient Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-100 dark:bg-emerald-500/20 flex items-center justify-center font-bold text-blue-700 dark:text-emerald-300 overflow-hidden border border-blue-200 dark:border-emerald-500/30">
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

                {/* Vitals & Tags */}
                <div className="space-y-2.5 text-xs pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>UID:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{pat.uid}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Gender / Age:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {pat.gender || "N/A"} • {pat.dob ? `${new Date().getFullYear() - new Date(pat.dob).getFullYear()} yrs` : "N/A"}
                    </span>
                  </div>

                  {pat.medicalHistory?.allergies?.length > 0 ? (
                    <div>
                      <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 mb-1">
                        <ShieldAlert size={12} /> Allergies:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {pat.medicalHistory.allergies.map((alg, i) => (
                          <span key={i} className="rounded-md bg-rose-100/70 px-1.5 py-0.5 text-[10px] font-semibold text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                            {alg}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Allergies:</span>
                      <span>None reported</span>
                    </div>
                  )}

                  {pat.lastDiagnosis && (
                    <div className="rounded-xl bg-blue-50/60 p-2 text-blue-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                      <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-emerald-400">Last Diagnosis</span>
                      <p className="font-semibold truncate">{pat.lastDiagnosis}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-4 mt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={FileText}
                  className="flex-1"
                  onClick={() => setSelectedDossierPatientId(pat._id)}
                >
                  Inspect EHR
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Pill}
                  className="flex-1"
                  onClick={() => openRx(pat)}
                >
                  Write Rx
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Dossier Modal */}
      <PatientDossierModal
        isOpen={Boolean(selectedDossierPatientId)}
        onClose={() => setSelectedDossierPatientId(null)}
        patientId={selectedDossierPatientId}
        onOpenRx={(pat) => openRx(pat)}
      />

      {/* Quick Prescription Modal */}
      <QuickPrescriptionModal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        defaultPatient={rxTargetPatient}
      />
    </div>
  );
}
