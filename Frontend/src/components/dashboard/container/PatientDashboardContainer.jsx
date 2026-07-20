import { useState } from "react";
import DashboardUI from "../presentational/DashboardUI";
import UploadReportModal from "../modals/UploadReportModal";
import AddMedicationModal from "../modals/AddMedicationModal";
import BookVisitModal from "../modals/BookVisitModal";
import { toast } from "react-hot-toast";
import { uploadReportRequest, addMedicationRequest, bookVisitRequest } from "../../../api/patient";

export default function PatientDashboardContainer({ patient }) {
  const [activeModal, setActiveModal] = useState(null); // 'upload' | 'medication' | 'book' | null

  const handleUploadSubmission = async (file) => {
    try {
      await uploadReportRequest(file);
      toast.success("Report uploaded successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to upload report");
      throw error;
    }
  };

  const handleAddMedication = async (medData) => {
    try {
      await addMedicationRequest(medData);
      toast.success("Medication added successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to add medication");
      throw error;
    }
  };

  const handleBookVisit = async (date) => {
    try {
      await bookVisitRequest(date);
      toast.success("Visit booked successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to book visit");
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
