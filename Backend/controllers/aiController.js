const { GoogleGenAI } = require("@google/genai");
const Patient = require("../models/Patient");
const { sanitizePatient } = require("../utils/sanitizePatient");

async function generateAISummary(req, res) {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Access denied. Patients only." });
    }

    // Force regeneration if requested (e.g. user clicked Update), otherwise use cached if it exists.
    const { forceUpdate } = req.body;

    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    if (patient.aiSummary && !forceUpdate) {
      return res.status(200).json({ summary: patient.aiSummary });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured on the server." });
    }

    // Compile patient data for the prompt
    const medicalHistory = patient.medicalHistory || {};
    const currentHealth = patient.currentHealth || {};
    const diagnostics = patient.diagnostics || {};

    const promptText = `
      You are a helpful and professional medical AI assistant.
      Please generate a concise, easy-to-understand summary of the patient's medical profile.
      Highlight any important health conditions, ongoing medications, and allergies.
      Keep it professional but simple enough for a patient to understand. Do not provide medical advice.

      Patient Info:
      Age/DOB: ${patient.dob ? patient.dob.toISOString().split("T")[0] : "Not provided"}
      Gender: ${patient.gender || "Not provided"}
      Blood Group: ${patient.bloodGroup || "Not provided"}

      Medical History:
      - Conditions: ${medicalHistory.healthConditions?.join(", ") || "None"}
      - Surgical Procedures: ${medicalHistory.surgicalProcedures?.join(", ") || "None"}
      - Allergies: ${medicalHistory.allergies?.join(", ") || "None"}

      Current Health:
      - Medications: ${
        currentHealth.medications?.map((m) => `${m.name} (${m.dosage}, ${m.timing})`).join("; ") || "None"
      }
      - Exercise Routine: ${currentHealth.exerciseRoutine || "Not provided"}
      - Mental Health Status: ${currentHealth.mentalHealthStatus || "Not provided"}
    `;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptText,
    });

    const summaryText = response.text;

    // Cache the new summary
    patient.aiSummary = summaryText;
    await patient.save();

    return res.status(200).json({
      summary: summaryText,
      patient: sanitizePatient(patient),
      message: "Summary generated successfully.",
    });
  } catch (error) {
    console.error("AI Summary generation error:", error);
    return res.status(500).json({ message: "Failed to generate AI summary.", error: error.message });
  }
}

module.exports = {
  generateAISummary,
};
