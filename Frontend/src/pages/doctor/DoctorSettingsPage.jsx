import { useEffect, useState } from "react";
import {
  Clock,
  Video,
  Bell,
  Pill,
  Save,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Settings as SettingsIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { useDoctorStore } from "../../store/doctorStore";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DoctorSettingsPage() {
  const { settings, fetchSettings, updateSettings, loading } = useDoctorStore();

  const [clinicHours, setClinicHours] = useState([
    { day: "Monday", startTime: "09:00", endTime: "17:00", active: true },
    { day: "Tuesday", startTime: "09:00", endTime: "17:00", active: true },
    { day: "Wednesday", startTime: "09:00", endTime: "17:00", active: true },
    { day: "Thursday", startTime: "09:00", endTime: "17:00", active: true },
    { day: "Friday", startTime: "09:00", endTime: "17:00", active: true },
    { day: "Saturday", startTime: "10:00", endTime: "14:00", active: false },
    { day: "Sunday", startTime: "10:00", endTime: "14:00", active: false },
  ]);

  const [allowTelemedicine, setAllowTelemedicine] = useState(true);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    sms: false,
    app: true,
  });

  const [commonMedications, setCommonMedications] = useState([
    { name: "Amoxicillin", defaultDosage: "500mg" },
    { name: "Paracetamol", defaultDosage: "650mg" },
    { name: "Cetirizine", defaultDosage: "10mg" },
  ]);

  const [newMed, setNewMed] = useState({ name: "", defaultDosage: "" });

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        if (data) {
          if (data.clinicHours && data.clinicHours.length > 0) {
            // merge with standard days
            const map = {};
            data.clinicHours.forEach((ch) => (map[ch.day] = ch));
            const merged = DAYS_OF_WEEK.map((d) => map[d] || { day: d, startTime: "09:00", endTime: "17:00", active: false });
            setClinicHours(merged);
          }
          if (data.allowTelemedicine !== undefined) {
            setAllowTelemedicine(data.allowTelemedicine);
          }
          if (data.notificationPreferences) {
            setNotificationPreferences({
              email: data.notificationPreferences.email ?? true,
              sms: data.notificationPreferences.sms ?? false,
              app: data.notificationPreferences.app ?? true,
            });
          }
          if (data.commonMedications && data.commonMedications.length > 0) {
            setCommonMedications(data.commonMedications);
          }
        }
      })
      .catch(() => {});
  }, [fetchSettings]);

  const handleHourChange = (index, field, value) => {
    const updated = [...clinicHours];
    updated[index][field] = value;
    setClinicHours(updated);
  };

  const handleAddMedPreset = () => {
    if (!newMed.name.trim()) return;
    setCommonMedications([...commonMedications, { ...newMed }]);
    setNewMed({ name: "", defaultDosage: "" });
  };

  const handleRemoveMedPreset = (idx) => {
    setCommonMedications(commonMedications.filter((_, i) => i !== idx));
  };

  const handleSaveAllSettings = async () => {
    try {
      const activeClinicHours = clinicHours
        .filter((h) => h.active)
        .map((h) => ({ day: h.day, startTime: h.startTime, endTime: h.endTime }));

      await updateSettings({
        clinicHours: activeClinicHours,
        allowTelemedicine,
        notificationPreferences,
        commonMedications,
      });

      toast.success("Practice schedule and preferences saved successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save settings.");
    }
  };

  if (loading && !settings) {
    return <Loader label="Loading settings..." />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Doctor Practice Settings"
          description="Configure your clinic hours, teleconsultation availability, presets, and alerts."
        />
        <Button
          variant="primary"
          icon={Save}
          onClick={handleSaveAllSettings}
          loading={loading}
          className="self-start sm:self-center"
        >
          Save All Settings
        </Button>
      </div>

      {/* Clinic Hours & Schedule */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Clock size={18} className="text-blue-600 dark:text-emerald-400" />
          <span>Clinic Operating Schedule & Availability</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Specify which days and time windows patients can book consultations with you.
        </p>

        <div className="space-y-2.5 pt-2">
          {clinicHours.map((item, idx) => (
            <div
              key={item.day}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                item.active
                  ? "border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40"
                  : "border-slate-100 bg-slate-50/20 opacity-60 dark:border-slate-900 dark:bg-slate-900/20"
              }`}
            >
              <div className="flex items-center gap-3 min-w-[120px]">
                <input
                  type="checkbox"
                  checked={item.active}
                  onChange={(e) => handleHourChange(idx, "active", e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-emerald-400"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.day}</span>
              </div>

              {item.active ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">From:</span>
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => handleHourChange(idx, "startTime", e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <span className="text-slate-400">To:</span>
                  <input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => handleHourChange(idx, "endTime", e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-medium">Closed / Off Duty</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Telemedicine & Notifications */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Telemedicine */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Video size={18} className="text-blue-600 dark:text-emerald-400" />
            <span>Teleconsultation Settings</span>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/40">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Enable Telemedicine Visits</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Allow patients to request video/remote visits.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowTelemedicine}
                onChange={(e) => setAllowTelemedicine(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 dark:peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Bell size={18} className="text-blue-600 dark:text-emerald-400" />
            <span>Consultation Alerts</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/40 cursor-pointer">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Email Alerts on New Booking</span>
              <input
                type="checkbox"
                checked={notificationPreferences.email}
                onChange={(e) =>
                  setNotificationPreferences({ ...notificationPreferences, email: e.target.checked })
                }
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-emerald-400"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/40 cursor-pointer">
              <span className="font-semibold text-slate-800 dark:text-slate-200">In-App Notification Banner</span>
              <input
                type="checkbox"
                checked={notificationPreferences.app}
                onChange={(e) =>
                  setNotificationPreferences({ ...notificationPreferences, app: e.target.checked })
                }
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-emerald-400"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/40 cursor-pointer">
              <span className="font-semibold text-slate-800 dark:text-slate-200">SMS Appointment Reminders</span>
              <input
                type="checkbox"
                checked={notificationPreferences.sms}
                onChange={(e) =>
                  setNotificationPreferences({ ...notificationPreferences, sms: e.target.checked })
                }
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-emerald-400"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Medication & Rx Presets */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Pill size={18} className="text-blue-600 dark:text-emerald-400" />
          <span>Quick Rx Presets & Common Medications</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Add frequently prescribed drugs for auto-completion in consultation notes and prescriptions.
        </p>

        {/* Add Preset Form */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="text"
            placeholder="Medication Name (e.g. Ibuprofen)"
            value={newMed.name}
            onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <input
            type="text"
            placeholder="Default Dosage (e.g. 400mg)"
            value={newMed.defaultDosage}
            onChange={(e) => setNewMed({ ...newMed, defaultDosage: e.target.value })}
            className="w-full sm:w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <Button size="sm" variant="secondary" onClick={handleAddMedPreset} icon={Plus}>
            Add Preset
          </Button>
        </div>

        {/* Presets List */}
        <div className="flex flex-wrap gap-2 pt-2">
          {commonMedications.map((m, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span className="font-bold">{m.name}</span>
              <span className="text-slate-400">({m.defaultDosage || "Std"})</span>
              <button
                type="button"
                onClick={() => handleRemoveMedPreset(idx)}
                className="text-slate-400 hover:text-rose-500 ml-1"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
