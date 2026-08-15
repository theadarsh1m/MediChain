/**
 * AI Controller.
 * Thin controller dispatching AI features for authenticated patients.
 */

const healthSummaryService = require("../services/ai/healthSummaryService");

/**
 * @desc    Generate AI Health Summary for authenticated patient
 * @route   POST /api/ai/health-summary
 * @access  Private (Patient only)
 */
async function getHealthSummary(req, res) {
  try {
    // Security: Patient ID MUST strictly originate from authenticated JWT session
    const patientId = req.user.id;

    const result = await healthSummaryService.generatePatientHealthSummary(patientId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[AI Controller] Error generating health summary:", error.message);

    // Return safe, user-friendly error without leaking sensitive internals
    const statusCode = error.message.includes("not found") ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: "Unable to generate your health summary right now. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = {
  getHealthSummary,
};
