import { useState } from "react";
import DashboardUI from "../presentational/DashboardUI";
import UploadReportModal from "../modals/UploadReportModal";
import AddMedicationModal from "../modals/AddMedicationModal";
import BookVisitModal from "../modals/BookVisitModal";
import { toast } from "react-hot-toast";

export default function PatientDashboardContainer({ patient }) {
  const [activeModal, setActiveModal] = useState(null); // 'upload' | 'medication' | 'book' | null
  const API_URL = import.meta.env.VITE_Backend_API_URL;

  const handleUploadSubmission = async (file) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/patient/action/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");
      toast.success("Report uploaded successfully!");
      // Ideally trigger a context/redux refresh here
    } catch (error) {
      toast.error(error.message || "Failed to upload report");
      throw error;
    }
  };

  const handleAddMedication = async (medData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/patient/action/medication`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(medData)
      });

      if (!res.ok) throw new Error("Adding medication failed");
      toast.success("Medication added successfully!");
      // Ideally trigger a context/redux refresh here
    } catch (error) {
      toast.error(error.message || "Failed to add medication");
      throw error;
    }
  };

  const handleBookVisit = async (date) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/patient/action/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date })
      });

      if (!res.ok) throw new Error("Booking visit failed");
      toast.success("Visit booked successfully!");
      // Ideally trigger a context/redux refresh here
    } catch (error) {
      toast.error(error.message || "Failed to book visit");
      throw error;
    }
  };

  return (
    <>
      <DashboardUI 
        patientData={patient} 
        isLoading={!patient} 
        onOpenUpload={() => setActiveModal('upload')}
        onOpenMedication={() => setActiveModal('medication')}
        onOpenBook={() => setActiveModal('book')}
      />

      <UploadReportModal 
        isOpen={activeModal === 'upload'}
        onClose={() => setActiveModal(null)}
        onUpload={handleUploadSubmission}
      />
      <AddMedicationModal 
        isOpen={activeModal === 'medication'}
        onClose={() => setActiveModal(null)}
        onAdd={handleAddMedication}
      />
      <BookVisitModal 
        isOpen={activeModal === 'book'}
        onClose={() => setActiveModal(null)}
        onBook={handleBookVisit}
      />
    </>
  );
}
