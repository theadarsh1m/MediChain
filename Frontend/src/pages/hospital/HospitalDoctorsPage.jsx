import { useEffect, useState } from "react";
import {
  BriefcaseMedical,
  Search,
  Plus,
  Filter,
  Stethoscope,
  Award,
  Video,
  DollarSign,
  Mail,
  UserCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import OnboardDoctorModal from "../../components/hospital/OnboardDoctorModal";
import { useHospitalStore } from "../../store/hospitalStore";

export default function HospitalDoctorsPage() {
  const { doctors, fetchDoctors, affiliateDoctor, profile, loading } = useHospitalStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [viewFilter, setViewFilter] = useState("all"); // "all" | "affiliated"
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [affiliatingId, setAffiliatingId] = useState(null);

  useEffect(() => {
    fetchDoctors(searchTerm);
  }, [searchTerm, fetchDoctors]);

  const handleAffiliate = async (doctorId, doctorName) => {
    setAffiliatingId(doctorId);
    try {
      await affiliateDoctor(doctorId);
      toast.success(`Dr. ${doctorName} is now affiliated with ${profile?.name || "your hospital"}!`);
      fetchDoctors(searchTerm);
    } catch (err) {
      toast.error(err.message || "Failed to affiliate doctor.");
    } finally {
      setAffiliatingId(null);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    // Check affiliation filter
    if (viewFilter === "affiliated") {
      const isAffiliated =
        doc.hospital === profile?.name ||
        doc.hospital === profile?._id ||
        doc.hospital === profile?.uid;
      if (!isAffiliated) return false;
    }

    // Check department filter
    if (selectedDept !== "All" && doc.specialization !== selectedDept) {
      return false;
    }

    // Check search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = doc.name?.toLowerCase().includes(q);
      const matchEmail = doc.email?.toLowerCase().includes(q);
      const matchSpec = doc.specialization?.toLowerCase().includes(q);
      const matchLicense = doc.licenseNumber?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchSpec && !matchLicense) {
        return false;
      }
    }

    return true;
  });

  const departments = ["All", ...new Set(doctors.map((d) => d.specialization).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Hospital Doctors & Practitioners"
          description="Manage, affiliate, and onboard physicians and clinical staff to your hospital."
        />
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setOnboardModalOpen(true)}
          className="self-start sm:self-center"
        >
          Onboard New Doctor
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search doctors by name, license, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-sm"
          />
        </div>

        {/* View Tabs & Department Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setViewFilter("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                viewFilter === "all"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              All Doctors ({doctors.length})
            </button>
            <button
              onClick={() => setViewFilter("affiliated")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                viewFilter === "affiliated"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Affiliated Staff
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "All" ? "All Specialties" : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading && doctors.length === 0 ? (
        <Loader label="Loading hospital medical staff..." />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          icon={BriefcaseMedical}
          title="No Doctors Found"
          description={
            searchTerm
              ? `No doctors match "${searchTerm}".`
              : viewFilter === "affiliated"
              ? "No doctors currently affiliated with this hospital. Switch to 'All Doctors' to affiliate practitioners or click Onboard Doctor."
              : "No doctors registered in the system."
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doc) => {
            const isAffiliated =
              doc.hospital === profile?.name ||
              doc.hospital === profile?._id ||
              doc.hospital === profile?.uid;

            return (
              <div
                key={doc._id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  {/* Doctor Head */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-100 dark:bg-emerald-500/20 flex items-center justify-center font-bold text-blue-700 dark:text-emerald-300 overflow-hidden border border-blue-200 dark:border-emerald-500/30">
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
                        <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-emerald-500/20 dark:text-emerald-300 mt-0.5">
                          {doc.specialization || "General Medicine"}
                        </span>
                      </div>
                    </div>

                    {isAffiliated ? (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        <CheckCircle2 size={11} /> Affiliated
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        External
                      </span>
                    )}
                  </div>

                  {/* Meta details */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span>License No:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{doc.licenseNumber || "N/A"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Experience:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.experience ? `${doc.experience} Years` : "5+ Years"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Consultation Fee:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">${doc.consultationFee || 50}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Telemedicine:</span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                        {doc.allowTelemedicine ?? true ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Hospital Tag:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                        {doc.hospital || "Independent"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 truncate max-w-[150px]">
                    <Mail size={12} /> {doc.email}
                  </span>

                  {!isAffiliated && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAffiliate(doc._id, doc.name)}
                      loading={affiliatingId === doc._id}
                      className="text-[11px] py-1 px-2.5 h-auto"
                    >
                      Affiliate
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Onboard Doctor Modal */}
      <OnboardDoctorModal
        isOpen={onboardModalOpen}
        onClose={() => setOnboardModalOpen(false)}
        onDoctorAdded={() => fetchDoctors()}
      />
    </div>
  );
}
