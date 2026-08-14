import { useState } from "react";
import { X, User, Briefcase, Award, Stethoscope, Save, Upload } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { useDoctorStore } from "../../store/doctorStore";

export default function EditDoctorProfileModal({ isOpen, onClose, doctor, onSaved }) {
  const { updateProfile, loading } = useDoctorStore();

  const [formData, setFormData] = useState({
    name: doctor?.name || "",
    dob: doctor?.dob ? new Date(doctor.dob).toISOString().split("T")[0] : "",
    gender: doctor?.gender || "Male",
    specialization: doctor?.specialization || "",
    licenseNumber: doctor?.licenseNumber || "",
    qualifications: Array.isArray(doctor?.qualifications)
      ? doctor.qualifications.join(", ")
      : doctor?.qualifications || "",
    experience: doctor?.experience || 0,
    hospital: doctor?.hospital || "",
    consultationFee: doctor?.consultationFee || 50,
    preferredLanguages: Array.isArray(doctor?.preferredLanguages)
      ? doctor.preferredLanguages.join(", ")
      : doctor?.preferredLanguages || "English",
    allowTelemedicine: doctor?.allowTelemedicine ?? true,
  });

  const [avatarFile, setAvatarFile] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "qualifications" || key === "preferredLanguages") {
          const arr = formData[key]
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          data.append(key, JSON.stringify(arr));
        } else {
          data.append(key, formData[key]);
        }
      });

      if (avatarFile) {
        data.append("profilePic", avatarFile);
      }

      await updateProfile(data);
      toast.success("Profile credentials updated successfully!");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Stethoscope size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Edit Doctor Credentials</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your specialization, licensing, and practice details.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Avatar Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-emerald-500/10 dark:file:text-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Specialization</label>
              <input
                type="text"
                name="specialization"
                placeholder="e.g. Cardiology, Neurology"
                value={formData.specialization}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Experience (Years)</label>
              <input
                type="number"
                name="experience"
                min="0"
                value={formData.experience}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Consultation Fee ($)</label>
              <input
                type="number"
                name="consultationFee"
                min="0"
                value={formData.consultationFee}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Hospital / Clinic</label>
              <input
                type="text"
                name="hospital"
                placeholder="e.g. City General Hospital"
                value={formData.hospital}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Qualifications (comma separated)</label>
              <input
                type="text"
                name="qualifications"
                placeholder="e.g. MBBS, MD, FRCP"
                value={formData.qualifications}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Preferred Languages</label>
              <input
                type="text"
                name="preferredLanguages"
                placeholder="e.g. English, Spanish, Hindi"
                value={formData.preferredLanguages}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="allowTelemedicine"
                  checked={formData.allowTelemedicine}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 dark:peer-checked:bg-emerald-500"></div>
              </label>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Allow Teleconsultations</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading} icon={Save}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
