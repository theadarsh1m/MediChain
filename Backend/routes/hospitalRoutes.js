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
