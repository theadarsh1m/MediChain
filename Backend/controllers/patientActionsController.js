const Patient = require("../models/Patient");
const { sanitizePatient } = require("../utils/sanitizePatient");

async function uploadDocument(req, res) {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Access denied. Patients only." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const fileUrl = req.file.path;
    
    // Add document to patient.admin.medicalDocuments
    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    patient.admin.medicalDocuments.push(fileUrl);
    await patient.save();

    return res.status(200).json({
      message: "Document uploaded successfully.",
      patient: sanitizePatient(patient),
    });
  } catch (error) {
    console.error("Upload document error:", error);
    return res.status(500).json({ message: "Server error during upload.", error: error.message });
  }
}

async function addMedication(req, res) {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Access denied. Patients only." });
    }

    const { name, dosage, timing } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Medication name is required." });
    }

    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    patient.currentHealth.medications.push({ name, dosage, timing });
    await patient.save();

    return res.status(200).json({
      message: "Medication added successfully.",
      patient: sanitizePatient(patient),
    });
  } catch (error) {
    console.error("Add medication error:", error);
    return res.status(500).json({ message: "Server error while adding medication.", error: error.message });
  }
}

async function bookVisit(req, res) {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Access denied. Patients only." });
    }

    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ message: "Appointment date is required." });
    }

    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    patient.admin.nextAppointment = new Date(date);
    await patient.save();

    return res.status(200).json({
      message: "Visit booked successfully.",
      patient: sanitizePatient(patient),
    });
  } catch (error) {
    console.error("Book visit error:", error);
    return res.status(500).json({ message: "Server error while booking visit.", error: error.message });
  }
}

module.exports = {
  uploadDocument,
  addMedication,
  bookVisit,
};
