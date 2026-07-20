const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getDoctors, getHospitals } = require("../controllers/publicController");

// Public endpoints, though they might require authentication depending on rules
// For now we'll require the user to be logged in (as patient) to see this list
router.get("/doctors", authMiddleware, getDoctors);
router.get("/hospitals", authMiddleware, getHospitals);

module.exports = router;
