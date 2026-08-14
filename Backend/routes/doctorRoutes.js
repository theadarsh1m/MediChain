const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const doctorMiddleware = require("../middleware/doctorMiddleware");
const upload = require("../middleware/uploadMiddleware");
const doctorController = require("../controllers/doctorController");

// All routes require authentication & doctor role
router.use(authMiddleware);
router.use(doctorMiddleware);

/**
 * @route   GET /doctor/profile
 * @desc    Fetch doctor profile
 * @access  Private (Doctor)
 */
router.get("/profile", doctorController.getProfile);

/**
 * @route   PUT /doctor/profile
 * @desc    Update doctor profile (with optional avatar upload)
 * @access  Private (Doctor)
 */
router.put("/profile", upload.single("profilePic"), doctorController.updateProfile);

/**
 * @route   GET /doctor/dashboard
 * @desc    Fetch doctor dashboard stats and today's queue
 * @access  Private (Doctor)
 */
router.get("/dashboard", doctorController.getDashboard);

/**
 * @route   GET /doctor/patients
 * @desc    Search and fetch doctor's patients
 * @access  Private (Doctor)
 */
router.get("/patients", doctorController.getPatients);

/**
 * @route   GET /doctor/patients/:patientId
 * @desc    Fetch full patient medical dossier
 * @access  Private (Doctor)
 */
router.get("/patients/:patientId", doctorController.getPatientDossier);

/**
 * @route   POST /doctor/consultation/complete
 * @desc    Complete consultation and write to EHR record
 * @access  Private (Doctor)
 */
router.post("/consultation/complete", doctorController.completeConsultation);

/**
 * @route   POST /doctor/patients/:patientId/prescription
 * @desc    Issue prescription to patient
 * @access  Private (Doctor)
 */
router.post("/patients/:patientId/prescription", doctorController.issuePrescription);

/**
 * @route   POST /doctor/patients/:patientId/notes
 * @desc    Add clinical consultation notes to patient
 * @access  Private (Doctor)
 */
router.post("/patients/:patientId/notes", doctorController.addClinicalNotes);

/**
 * @route   POST /doctor/upload-to-patient/:patientId
 * @desc    Upload medical document/report to patient record
 * @access  Private (Doctor)
 */
router.post("/upload-to-patient/:patientId", upload.single("file"), doctorController.uploadToPatient);

/**
 * @route   GET /doctor/settings
 * @desc    Fetch doctor settings (schedule, clinic hours, alerts)
 * @access  Private (Doctor)
 */
router.get("/settings", doctorController.getSettings);

/**
 * @route   PUT /doctor/settings
 * @desc    Update doctor settings
 * @access  Private (Doctor)
 */
router.put("/settings", doctorController.updateSettings);

// Multer error handler for doctor router
router.use((err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File too large (max 2MB)." });
  }

  if (err) {
    return res.status(400).json({ message: "Upload failed.", error: err.message });
  }

  return next();
});

module.exports = router;
