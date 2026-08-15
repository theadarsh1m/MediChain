/**
 * Health Summary Service.
 * Collects sanitized, minimal clinical data for the authenticated patient,
 * validates data sufficiency, calls the AI provider, and returns a safe summary.
 */

const Patient = require("../../models/Patient");
const Doctor = require("../../models/Doctor");
const Hospital = require("../../models/Hospital");
const Appointment = require("../../models/Appointment");
const { buildHealthSummaryPrompt } = require("./prompts/healthSummaryPrompt");
const { generateHealthSummaryWithGemini } = require("./aiService");

const DISCLAIMER_TEXT =
  "This AI-generated health summary is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult your qualified healthcare provider with any questions regarding a medical condition.";

/**
 * Calculates approximate age from Date of Birth.
 */
function calculateAge(dob) {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

/**
 * Assembles minimal sanitized patient medical context.
 */
async function assemblePatientMedicalData(patientId) {
  const patient = await Patient.findById(patientId).select(
    "name dob gender bloodGroup medicalHistory currentHealth admin diagnostics createdAt"
  );

  if (!patient) {
    throw new Error("Patient not found.");
  }

  // Fetch recent appointments (completed and upcoming)
  const appointments = await Appointment.find({ patient: patientId })
    .populate("doctor", "name specialization department")
    .populate("hospital", "name")
    .sort({ appointmentDate: -1 })
    .limit(6);

  // 1. Demographics (No passwords, PII like phone/address stripped)
  const age = calculateAge(patient.dob);
  const demographics = {
    age: age ? `${age} years` : "Not recorded",
    gender: patient.gender || "Not recorded",
    bloodGroup: patient.bloodGroup || "Not recorded",
  };

  // 2. Known Medical History
  const medicalHistory = {
    knownAllergies: patient.medicalHistory?.allergies?.length
      ? patient.medicalHistory.allergies
      : ["None documented"],
    chronicConditions: patient.medicalHistory?.healthConditions?.length
      ? patient.medicalHistory.healthConditions
      : ["None documented"],
    surgicalProcedures: patient.medicalHistory?.surgicalProcedures?.length
      ? patient.medicalHistory.surgicalProcedures
      : ["None documented"],
    hospitalizations: patient.medicalHistory?.pastHospitalizations?.length
      ? patient.medicalHistory.pastHospitalizations.map((h) => ({
          reason: h.reason,
          duration: h.duration,
        }))
      : [],
  };

  // 3. Current Vitals
  const vitals = {
    bloodPressure: patient.currentHealth?.vitals?.bloodPressure || null,
    heartRate: patient.currentHealth?.vitals?.heartRate ? `${patient.currentHealth.vitals.heartRate} BPM` : null,
    temperature: patient.currentHealth?.vitals?.temperature ? `${patient.currentHealth.vitals.temperature}°F` : null,
    weight: patient.currentHealth?.vitals?.weight ? `${patient.currentHealth.vitals.weight} kg` : null,
    spO2: patient.currentHealth?.vitals?.spO2 ? `${patient.currentHealth.vitals.spO2}%` : null,
    recordedAt: patient.currentHealth?.vitals?.recordedAt || null,
  };

  // 4. Medications & Prescriptions
  const medicationsList = [];

  if (patient.currentHealth?.medications?.length) {
    patient.currentHealth.medications.forEach((m) => {
      medicationsList.push({
        name: m.name,
        dosage: m.dosage || "Standard",
        frequency: m.timing || "As directed",
      });
    });
  }

  // Extract from recent past consultations
  if (patient.admin?.pastConsultations?.length) {
    const recentConsultations = patient.admin.pastConsultations.slice(-3);
    recentConsultations.forEach((c) => {
      if (c.prescriptionsList?.length) {
        c.prescriptionsList.forEach((rx) => {
          if (!medicationsList.some((m) => m.name.toLowerCase() === rx.medicineName.toLowerCase())) {
            medicationsList.push({
              name: rx.medicineName,
              dosage: rx.dosage || "Standard",
              frequency: rx.frequency || "As directed",
              duration: rx.duration || "Course",
            });
          }
        });
      } else if (c.prescription && typeof c.prescription === "string") {
        medicationsList.push({
          name: c.prescription.split("\n")[0] || "Prescribed medication",
          dosage: "Per consultation",
          frequency: "As directed",
        });
      }
    });
  }

  // 5. Recent Consultations & Clinical Diagnoses
  const recentConsultations = [];

  if (patient.admin?.pastConsultations?.length) {
    patient.admin.pastConsultations.slice(-3).forEach((c) => {
      recentConsultations.push({
        doctorSpecialty: c.doctorSpecialization || "General Medicine",
        date: c.date ? new Date(c.date).toISOString().split("T")[0] : "Recent",
        diagnosis: c.diagnosis || "General Consultation",
        notesSummary: c.notes ? c.notes.slice(0, 150) : "Routine evaluation",
      });
    });
  }

  appointments
    .filter((a) => a.status === "Completed" && a.diagnosis)
    .slice(0, 3)
    .forEach((a) => {
      if (!recentConsultations.some((c) => c.diagnosis === a.diagnosis)) {
        recentConsultations.push({
          doctorSpecialty: a.doctor?.specialization || "Physician",
          date: new Date(a.appointmentDate).toISOString().split("T")[0],
          diagnosis: a.diagnosis,
          notesSummary: a.notes ? a.notes.slice(0, 150) : "Consultation completed",
        });
      }
    });

  // 6. Upcoming Care
  const todayStr = new Date().toISOString().split("T")[0];
  const nextAppointment = appointments.find((a) => {
    const aDate = new Date(a.appointmentDate).toISOString().split("T")[0];
    return aDate >= todayStr && ["Confirmed", "Pending", "Requested", "Rescheduled"].includes(a.status);
  });

  const upcomingCare = nextAppointment
    ? {
        hasUpcoming: true,
        date: new Date(nextAppointment.appointmentDate).toISOString().split("T")[0],
        time: nextAppointment.appointmentTime,
        doctorSpecialty: nextAppointment.doctor?.specialization || "Physician",
        hospital: nextAppointment.hospital?.name || "Medical Center",
        status: nextAppointment.status,
      }
    : {
        hasUpcoming: false,
        message: "No upcoming appointments currently scheduled.",
      };

  // 7. Check Data Sufficiency
  const hasVitals = Boolean(vitals.bloodPressure || vitals.heartRate || vitals.temperature);
  const hasMedications = medicationsList.length > 0;
  const hasDiagnoses = recentConsultations.length > 0;
  const hasConditions = patient.medicalHistory?.healthConditions?.length > 0;
  const hasAppointments = appointments.length > 0;

  const hasSufficientData = hasVitals || hasMedications || hasDiagnoses || hasConditions || hasAppointments;

  return {
    hasSufficientData,
    data: {
      demographics,
      medicalHistory,
      vitals,
      medications: medicationsList,
      recentConsultations,
      upcomingCare,
    },
  };
}

/**
 * Main service method to produce a verified health summary.
 */
async function generatePatientHealthSummary(patientId) {
  const { hasSufficientData, data } = await assemblePatientMedicalData(patientId);

  if (!hasSufficientData) {
    return {
      hasSufficientData: false,
      summary: {
        overallSummary: "There isn't enough medical information yet to generate a meaningful health summary.",
        recentHealth: "No recent clinical evaluations or diagnoses recorded.",
        medications: [],
        vitals: [],
        upcomingCare: "Consider booking a wellness checkup or uploading your diagnostic reports to get started.",
        doctorDiscussionPoints: [
          "Schedule an initial consultation with a primary care doctor.",
          "Record your baseline vitals during your next visit.",
        ],
      },
      generatedAt: new Date().toISOString(),
      disclaimer: DISCLAIMER_TEXT,
    };
  }

  const { systemInstruction, userPrompt } = buildHealthSummaryPrompt(data);
  const structuredOutput = await generateHealthSummaryWithGemini({ systemInstruction, userPrompt });

  return {
    hasSufficientData: true,
    summary: structuredOutput,
    generatedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER_TEXT,
  };
}

module.exports = {
  generatePatientHealthSummary,
  assemblePatientMedicalData,
};
