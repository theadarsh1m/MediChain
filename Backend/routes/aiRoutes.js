/**
 * AI Routes.
 * Protected endpoints for AI features, restricted to authenticated patients with rate limiting.
 */

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const patientMiddleware = require("../middleware/patientMiddleware");
const aiRateLimiter = require("../middleware/aiRateLimiter");
const aiController = require("../controllers/aiController");

// All AI Health Summary requests require verified authentication, patient role, and rate limiting
router.post(
  "/health-summary",
  authMiddleware,
  patientMiddleware,
  aiRateLimiter,
  aiController.getHealthSummary
);

module.exports = router;
