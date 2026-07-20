import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, Clock, FileText, Hospital, Stethoscope, Type, Activity } from "lucide-react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import PageHeader from "../../components/ui/PageHeader";
import Section from "../../components/ui/Section";
import { useAppointmentStore } from "../../store/appointmentStore";

export default function AppointmentBookingPage() {
  const navigate = useNavigate();
  const { doctors, hospitals, fetchPublicLists, createAppointment, loading } = useAppointmentStore();

  const [formData, setFormData] = useState({
    hospital: "",
    doctor: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    symptoms: "",
    notes: "",
  });

  useEffect(() => {
    fetchPublicLists();
  }, [fetchPublicLists]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        symptoms: formData.symptoms ? formData.symptoms.split(",").map((s) => s.trim()) : [],
      };
      await createAppointment(dataToSubmit);
      toast.success("Appointment booked successfully!");
      navigate("/patient/appointments"); // We will create this history route
    } catch (error) {
      toast.error(error.message || "Failed to book appointment");
    }
  };

  if (loading && doctors.length === 0) {
    return <Loader label="Loading booking details..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Appointment"
        description="Schedule a visit with your preferred doctor and hospital."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Location & Provider" description="Select where and who you want to visit">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="hospital" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Hospital
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Hospital size={16} />
                </div>
                <select
                  name="hospital"
                  id="hospital"
                  required
                  value={formData.hospital}
                  onChange={handleChange}
                  className="block w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100"
                >
                  <option value="" disabled>
                    Select a hospital
                  </option>
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="doctor" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Doctor
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Stethoscope size={16} />
                </div>
                <select
                  name="doctor"
                  id="doctor"
                  required
                  value={formData.doctor}
                  onChange={handleChange}
                  className="block w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100"
                >
                  <option value="" disabled>
                    Select a doctor
                  </option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.name} - {d.specialization}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Date & Time" description="When would you like to visit?">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              icon={Calendar}
              label="Date"
              type="date"
              name="appointmentDate"
              required
              value={formData.appointmentDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
            />
            <Input
              icon={Clock}
              label="Time"
              type="time"
              name="appointmentTime"
              required
              value={formData.appointmentTime}
              onChange={handleChange}
            />
          </div>
        </Section>

        <Section title="Visit Details" description="Help the doctor understand your needs">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              icon={Type}
              label="Reason for Visit"
              name="reason"
              placeholder="e.g., Annual Checkup, Headaches"
              required
              value={formData.reason}
              onChange={handleChange}
            />
            <Input
              icon={Activity}
              label="Symptoms (comma separated)"
              name="symptoms"
              placeholder="e.g., Fever, Cough"
              value={formData.symptoms}
              onChange={handleChange}
            />
            <div className="sm:col-span-2">
              <Input
                icon={FileText}
                label="Additional Notes (optional)"
                name="notes"
                placeholder="Any other details the doctor should know?"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>
        </Section>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Book Appointment
          </Button>
        </div>
      </form>
    </div>
  );
}
