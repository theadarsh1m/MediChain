const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const doctorService = require("../services/doctorService");

async function getProfile(req, res) {
  try {
    const profile = await doctorService.getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: "Doctor profile not found." });
    }
    return res.status(200).json({ profile });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const fileUrl = req.file?.path;
    const profile = await doctorService.updateDoctorProfile(req.user.id, req.body, fileUrl);
    if (!profile) {
      return res.status(404).json({ message: "Doctor profile not found." });
    }
    return res.status(200).json({ message: "Profile updated successfully.", profile });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function getDashboard(req, res) {
  try {
    const doctor = await Doctor.findById(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }
    const dashboardData = await doctorService.getDoctorDashboardStats(doctor);
    return res.status(200).json({ dashboard: dashboardData });
  } catch (error) {
    console.error("Error fetching doctor dashboard:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function getPatients(req, res) {
  try {
    const { search } = req.query;
    const patients = await doctorService.getDoctorPatients(req.user.id, search);
    return res.status(200).json({ patients });
  } catch (error) {
    console.error("Error fetching doctor patients:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function getPatientDossier(req, res) {
  try {
    const { patientId } = req.params;
    const dossier = await doctorService.getPatientDossier(patientId, req.user.id);
    if (!dossier) {
      return res.status(404).json({ message: "Patient not found." });
    }
    return res.status(200).json({ dossier });
  } catch (error) {
    console.error("Error fetching patient dossier:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function completeConsultation(req, res) {
  try {
    const result = await doctorService.completeConsultation(req.user.id, req.body);
    return res.status(200).json({
      message: "Consultation completed and saved to EHR successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Error completing consultation:", error);
    return res.status(500).json({ message: error.message || "Failed to complete consultation." });
  }
}

async function issuePrescription(req, res) {
  try {
    const { patientId } = req.params;
    const result = await doctorService.issuePrescription(req.user.id, patientId, req.body);
    return res.status(200).json({ message: "Prescription issued successfully.", ...result });
  } catch (error) {
    console.error("Error issuing prescription:", error);
    return res.status(500).json({ message: error.message || "Failed to issue prescription." });
  }
}

async function addClinicalNotes(req, res) {
  try {
    const { patientId } = req.params;
    const result = await doctorService.addClinicalNotes(req.user.id, patientId, req.body);
    return res.status(200).json({ message: "Clinical notes recorded successfully.", ...result });
  } catch (error) {
    console.error("Error adding clinical notes:", error);
    return res.status(500).json({ message: error.message || "Failed to add clinical notes." });
  }
}

async function uploadToPatient(req, res) {
  try {
    const { patientId } = req.params;
    const fileUrl = req.file?.path;
    if (!fileUrl) {
      return res.status(400).json({ message: "File upload failed or no file provided." });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    patient.admin.medicalDocuments = patient.admin.medicalDocuments || [];
    patient.admin.medicalDocuments.push(fileUrl);
    await patient.save();

    return res.status(200).json({
      message: "File uploaded successfully to patient record.",
      fileUrl: fileUrl,
    });
  } catch (error) {
    console.error("Error uploading file to patient record:", error);
    return res.status(500).json({ message: "Server error uploading file.", error: error.message });
  }
}

async function getSettings(req, res) {
  try {
    const settings = await doctorService.getDoctorSettings(req.user.id);
    if (!settings) {
      return res.status(404).json({ message: "Doctor settings not found." });
    }
    return res.status(200).json({ settings });
  } catch (error) {
    console.error("Error fetching doctor settings:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function updateSettings(req, res) {
  try {
    const settings = await doctorService.updateDoctorSettings(req.user.id, req.body.settings || req.body);
    if (!settings) {
      return res.status(404).json({ message: "Doctor settings not found." });
    }
    return res.status(200).json({ message: "Settings updated successfully.", settings });
  } catch (error) {
    console.error("Error updating doctor settings:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getPatients,
  getPatientDossier,
  completeConsultation,
  issuePrescription,
  addClinicalNotes,
  uploadToPatient,
  getSettings,
  updateSettings,
};
