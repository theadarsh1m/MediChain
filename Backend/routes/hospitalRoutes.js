const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const hospitalMiddleware = require("../middleware/hospitalMiddleware");

const hospitalController = require("../controllers/hospitalController");
const {
  validateHospitalProfileUpdate,
  validateHospitalSettingsUpdate,
} = require("../validators/hospitalValidators");

// All routes require authentication & hospital role auth
router.use(authMiddleware);
router.use(hospitalMiddleware);

/**
 * @route   GET /hospital/profile
 * @desc    Fetch hospital profile
 * @access  Private (Hospital)
 */
router.get("/profile", hospitalController.getProfile);

/**
 * @route   PUT /hospital/profile
 * @desc    Update hospital profile
 * @access  Private (Hospital)
 */
router.put("/profile", validateHospitalProfileUpdate, hospitalController.updateProfile);

/**
 * @route   PUT /hospital/beds
 * @desc    Update hospital bed capacity
 * @access  Private (Hospital)
 */
router.put("/beds", hospitalController.updateBeds);

/**
 * @route   GET /hospital/dashboard
 * @desc    Fetch hospital dashboard stats
 * @access  Private (Hospital)
 */
router.get("/dashboard", hospitalController.getDashboard);

/**
 * @route   GET /hospital/stats
 * @desc    Fetch detailed hospital stats
 * @access  Private (Hospital)
 */
router.get("/stats", hospitalController.getStats);

/**
 * @route   GET /hospital/doctors
 * @desc    Fetch hospital doctors
 * @access  Private (Hospital)
 */
router.get("/doctors", hospitalController.getDoctors);

/**
 * @route   POST /hospital/doctors/onboard
 * @desc    Onboard a doctor to hospital
 * @access  Private (Hospital)
 */
router.post("/doctors/onboard", hospitalController.onboardDoctor);

/**
 * @route   POST /hospital/doctors/:doctorId/affiliate
 * @desc    Affiliate an existing doctor with this hospital
 * @access  Private (Hospital)
 */
router.post("/doctors/:doctorId/affiliate", hospitalController.affiliateDoctor);

/**
 * @route   GET /hospital/patients
 * @desc    Fetch hospital patients
 * @access  Private (Hospital)
 */
router.get("/patients", hospitalController.getPatients);

/**
 * @route   POST /hospital/patients/admit
 * @desc    Record patient hospital admission
 * @access  Private (Hospital)
 */
router.post("/patients/admit", hospitalController.admitPatient);

/**
 * @route   GET /hospital/departments
 * @desc    Fetch hospital departments
 * @access  Private (Hospital)
 */
router.get("/departments", hospitalController.getDepartments);

/**
 * @route   GET /hospital/reports
 * @desc    Fetch hospital analytics reports
 * @access  Private (Hospital)
 */
router.get("/reports", hospitalController.getReports);

/**
 * @route   GET /hospital/activity
 * @desc    Fetch recent hospital activities
 * @access  Private (Hospital)
 */
router.get("/activity", hospitalController.getActivity);

/**
 * @route   GET /hospital/settings
 * @desc    Fetch hospital settings
 * @access  Private (Hospital)
 */
router.get("/settings", hospitalController.getSettings);

/**
 * @route   PUT /hospital/settings
 * @desc    Update hospital settings
 * @access  Private (Hospital)
 */
router.put("/settings", validateHospitalSettingsUpdate, hospitalController.updateSettings);

module.exports = router;
