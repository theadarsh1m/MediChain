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
 * @route   GET /hospital/doctors
 * @desc    Fetch hospital doctors with workload & status
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
 * @route   PUT /hospital/doctors/:doctorId/status
 * @desc    Approve, Activate, or Suspend a doctor
 * @access  Private (Hospital)
 */
router.put("/doctors/:doctorId/status", hospitalController.updateDoctorStatus);

/**
 * @route   PUT /hospital/doctors/:doctorId/department
 * @desc    Assign doctor department
 * @access  Private (Hospital)
 */
router.put("/doctors/:doctorId/department", hospitalController.assignDoctorDepartment);

/**
 * @route   GET /hospital/patients
 * @desc    Fetch hospital patients (administrative view with clinical privacy boundaries)
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
 * @desc    Fetch hospital departments and wings
 * @access  Private (Hospital)
 */
router.get("/departments", hospitalController.getDepartments);

/**
 * @route   GET /hospital/appointments
 * @desc    Fetch global hospital appointments
 * @access  Private (Hospital)
 */
router.get("/appointments", hospitalController.getAppointments);

/**
 * @route   PUT /hospital/appointments/:appointmentId/reassign
 * @desc    Reassign appointment to another doctor
 * @access  Private (Hospital)
 */
router.put("/appointments/:appointmentId/reassign", hospitalController.reassignAppointment);

/**
 * @route   PUT /hospital/appointments/:appointmentId/cancel
 * @desc    Cancel appointment by hospital administration
 * @access  Private (Hospital)
 */
router.put("/appointments/:appointmentId/cancel", hospitalController.cancelAppointment);

/**
 * @route   GET /hospital/reports
 * @desc    Fetch hospital analytics reports
 * @access  Private (Hospital)
 */
router.get("/reports", hospitalController.getReports);

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
