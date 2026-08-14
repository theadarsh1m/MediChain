import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  Bed,
  Save,
  Bell,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";

import { auth } from "../../firebase";
import { logout } from "../../features/auth/authSlice";
import { useAppDispatch } from "../../hooks/reduxHooks";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { useHospitalStore } from "../../store/hospitalStore";

export default function HospitalSettingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { profile, fetchProfile, updateProfile, settings, fetchSettings, updateSettings, loading } =
    useHospitalStore();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    numberOfBeds: 100,
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    emergencyBroadcasts: true,
    admissionAlerts: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile().then((p) => {
      if (p) {
        setFormData({
          name: p.name || "",
          address: p.address || "",
          contactNumber: p.contactNumber || "",
          numberOfBeds: p.numberOfBeds || 100,
        });
      }
    });

    fetchSettings().then((s) => {
      if (s && s.notificationPreferences) {
        setNotificationPreferences({
          email: s.notificationPreferences.email ?? true,
          emergencyBroadcasts: s.notificationPreferences.emergencyBroadcasts ?? true,
          admissionAlerts: s.notificationPreferences.admissionAlerts ?? true,
        });
      }
    });
  }, [fetchProfile, fetchSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfileAndSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      await updateSettings({ notificationPreferences });
      toast.success("Hospital configuration updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update hospital settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth).catch(() => {});
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  if (loading && !profile) {
    return <Loader label="Loading hospital settings..." />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Hospital Settings & Configuration"
          description="Manage facility details, bed counts, emergency alerts, and security."
        />
        <Button
          variant="primary"
          icon={Save}
          onClick={handleSaveProfileAndSettings}
          loading={saving}
          className="self-start sm:self-center"
        >
          Save Configuration
        </Button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfileAndSettings} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Building2 size={18} className="text-blue-600 dark:text-emerald-400" />
            <span>Hospital Facility Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hospital / Clinic Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone Number
              </label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="+1 (555) 234-5678"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hospital Address / Location
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="100 Medical Center Blvd, Health City"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Bed Capacity
              </label>
              <input
                type="number"
                name="numberOfBeds"
                min="0"
                value={formData.numberOfBeds}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Notifications & System Preferences */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Bell size={18} className="text-blue-600 dark:text-emerald-400" />
            <span>Hospital Alert & Broadcast Preferences</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/40 cursor-pointer">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Email Notifications for Admissions</p>
                <p className="text-[11px] text-slate-400">Receive email alerts when patient admissions or appointments are logged.</p>
              </div>
              <input
                type="checkbox"
                checked={notificationPreferences.email}
                onChange={(e) =>
                  setNotificationPreferences({ ...notificationPreferences, email: e.target.checked })
                }
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-emerald-400"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/40 cursor-pointer">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Emergency Broadcast Network</p>
                <p className="text-[11px] text-slate-400">Enable automated emergency ward coordination broadcasts.</p>
              </div>
              <input
                type="checkbox"
                checked={notificationPreferences.emergencyBroadcasts}
                onChange={(e) =>
                  setNotificationPreferences({
                    ...notificationPreferences,
                    emergencyBroadcasts: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-emerald-400"
              />
            </label>
          </div>
        </div>
      </form>

      {/* Account Sign Out */}
      <div className="rounded-3xl border border-red-100 bg-red-50/50 p-6 dark:border-red-900/30 dark:bg-red-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-red-700 dark:text-red-400 text-sm">Hospital Session Sign Out</h3>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
              Sign out of your hospital administration account on this device.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout} icon={LogOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
