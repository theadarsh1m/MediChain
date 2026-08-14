import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  User,
  Stethoscope,
  Briefcase,
  Award,
  Calendar,
  Mail,
  Building2,
  Edit2,
  DollarSign,
  Languages,
  Video,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { signOut } from "firebase/auth";

import { auth } from "../../firebase";
import { logout } from "../../features/auth/authSlice";
import { useAppDispatch } from "../../hooks/reduxHooks";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import EditDoctorProfileModal from "../../components/doctor/EditDoctorProfileModal";
import { useDoctorStore } from "../../store/doctorStore";

export default function DoctorProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const doctor = outletContext?.doctor;

  const { profile, fetchProfile, loading } = useDoctorStore();
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile().catch(() => {});
  }, [fetchProfile]);

  const activeDoc = profile || doctor;

  const handleLogout = async () => {
    await signOut(auth).catch(() => {});
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const qualifications = Array.isArray(activeDoc?.qualifications)
    ? activeDoc.qualifications
    : activeDoc?.qualifications
    ? [activeDoc.qualifications]
    : ["MBBS"];

  const languages = Array.isArray(activeDoc?.preferredLanguages)
    ? activeDoc.preferredLanguages
    : activeDoc?.preferredLanguages
    ? [activeDoc.preferredLanguages]
    : ["English"];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Doctor Profile & Credentials"
          description="View and update your medical licenses, specialization, and practice information."
        />
        <Button
          variant="primary"
          icon={Edit2}
          onClick={() => setEditModalOpen(true)}
          className="self-start sm:self-center"
        >
          Edit Profile
        </Button>
      </div>

      {/* Hero Profile Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="h-28 w-28 shrink-0 rounded-3xl bg-blue-100 dark:bg-emerald-500/20 flex items-center justify-center font-bold text-3xl text-blue-700 dark:text-emerald-300 overflow-hidden border-2 border-blue-200 dark:border-emerald-500/30 shadow-md">
            {activeDoc?.profilePic ? (
              <img src={activeDoc.profilePic} alt={activeDoc.name} className="h-full w-full object-cover" />
            ) : (
              activeDoc?.name?.charAt(0) || "D"
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                Dr. {activeDoc?.name || "Practitioner"}
              </h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-emerald-500/20 dark:text-emerald-300 self-center sm:self-auto">
                {activeDoc?.specialization || "General Medicine"}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span className="flex items-center gap-1"><Mail size={13} /> {activeDoc?.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Building2 size={13} /> {activeDoc?.hospital || "MediVault Partner Hospital"}</span>
              <span>•</span>
              <span className="font-mono text-blue-600 dark:text-emerald-400 font-bold">LIC: {activeDoc?.licenseNumber || "N/A"}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              {qualifications.map((q, idx) => (
                <span
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  🎓 {q}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Credentials & Practice Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Practice Details */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Stethoscope size={18} className="text-blue-600 dark:text-emerald-400" />
            <span>Consultation & Practice</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Standard Consultation Fee</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                ${activeDoc?.consultationFee || 50} USD
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Years of Experience</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {activeDoc?.experience ? `${activeDoc.experience} Years` : "5+ Years"}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Telemedicine Consultations</span>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                {activeDoc?.allowTelemedicine ?? true ? "Enabled" : "Disabled"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Preferred Languages</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {languages.join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* Verification & Compliance */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <ShieldCheck size={18} className="text-blue-600 dark:text-emerald-400" />
            <span>Verification & MediVault Network</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">System Role</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Doctor / Practitioner</span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">License Verification</span>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                Active & Verified
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Encrypted EHR Access</span>
              <span className="font-semibold text-blue-600 dark:text-emerald-400">Granted (Patient-Consented)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Practitioner UID</span>
              <span className="font-mono text-slate-600 dark:text-slate-400">{activeDoc?.uid || activeDoc?._id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="rounded-3xl border border-red-100 bg-red-50/50 p-6 dark:border-red-900/30 dark:bg-red-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-red-700 dark:text-red-400 text-sm">Account Sign Out</h3>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
              Securely sign out of your doctor portal session on this device.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout} icon={LogOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <EditDoctorProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        doctor={activeDoc}
        onSaved={fetchProfile}
      />
    </div>
  );
}
