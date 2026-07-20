import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle, ClipboardList, Edit3, XCircle } from "lucide-react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import PageHeader from "../../components/ui/PageHeader";
import Section from "../../components/ui/Section";
import { useAppointmentStore } from "../../store/appointmentStore";

export default function AppointmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentAppointment, fetchAppointmentById, updateStatus, updateNotes, loading } = useAppointmentStore();

  const [notesData, setNotesData] = useState({
    diagnosis: "",
    notes: "",
    prescription: "",
  });

  useEffect(() => {
    fetchAppointmentById(id);
  }, [id, fetchAppointmentById]);

  useEffect(() => {
    if (currentAppointment) {
      setNotesData({
        diagnosis: currentAppointment.diagnosis || "",
        notes: currentAppointment.notes || "",
        prescription: currentAppointment.prescription || "",
      });
    }
  }, [currentAppointment]);

  const handleNotesChange = (e) => {
    setNotesData({ ...notesData, [e.target.name]: e.target.value });
  };

  const handleSaveNotes = async () => {
    try {
      await updateNotes(id, notesData);
      toast.success("Consultation notes saved.");
    } catch (error) {
      toast.error(error.message || "Failed to save notes");
    }
  };

  const handleComplete = async () => {
    try {
      await updateStatus(id, "Completed");
      toast.success("Appointment marked as completed.");
      navigate("/doctor/appointments");
    } catch (error) {
      toast.error(error.message || "Failed to complete appointment");
    }
  };

  if (loading && !currentAppointment) {
    return <Loader label="Loading appointment details..." />;
  }

  if (!currentAppointment) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Appointment not found.
      </div>
    );
  }

  const { patient, hospital, status, appointmentDate, appointmentTime, reason, symptoms } = currentAppointment;
  const isEditable = ["Confirmed", "Rescheduled"].includes(status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Appointment Details" description="View patient info and add consultation notes." />
        <Button variant="secondary" onClick={() => navigate("/doctor/appointments")}>Back to Queue</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Info Column */}
        <div className="space-y-6 lg:col-span-1">
          <Section title="Patient Information">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                  {patient?.profilePic ? (
                    <img src={patient.profilePic} alt={patient.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">{patient?.name?.charAt(0)}</div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{patient?.name}</h3>
                  <p className="text-sm text-slate-500">{patient?.uid}</p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-sm"><strong>Age:</strong> {new Date().getFullYear() - new Date(patient?.dob).getFullYear()}</p>
                <p className="text-sm"><strong>Gender:</strong> {patient?.gender}</p>
                <p className="text-sm"><strong>Email:</strong> {patient?.email}</p>
              </div>
            </div>
          </Section>

          <Section title="Booking Details">
            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Date:</strong> {new Date(appointmentDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {appointmentTime}</p>
              <p><strong>Hospital:</strong> {hospital?.name}</p>
              <p><strong>Reason:</strong> {reason}</p>
              {symptoms && symptoms.length > 0 && (
                <p><strong>Symptoms:</strong> {symptoms.join(", ")}</p>
              )}
            </div>
          </Section>
        </div>

        {/* Consultation Notes Column */}
        <div className="space-y-6 lg:col-span-2">
          <Section title="Consultation Notes" description="Add your medical notes, diagnosis and prescription.">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Diagnosis</label>
                <textarea
                  name="diagnosis"
                  value={notesData.diagnosis}
                  onChange={handleNotesChange}
                  disabled={!isEditable}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  rows="2"
                  placeholder="Enter primary diagnosis..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Clinical Notes</label>
                <textarea
                  name="notes"
                  value={notesData.notes}
                  onChange={handleNotesChange}
                  disabled={!isEditable}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  rows="4"
                  placeholder="Observations, vitals, next steps..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Prescription / Medication</label>
                <textarea
                  name="prescription"
                  value={notesData.prescription}
                  onChange={handleNotesChange}
                  disabled={!isEditable}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  rows="3"
                  placeholder="Rx details..."
                />
              </div>

              {isEditable && (
                <div className="flex gap-3 pt-4">
                  <Button variant="secondary" onClick={handleSaveNotes} icon={Edit3}>
                    Save Draft
                  </Button>
                  <Button variant="primary" onClick={handleComplete} icon={CheckCircle}>
                    Mark as Completed
                  </Button>
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
