const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const { sanitizePatient } = require("../utils/sanitizePatient");

async function getDoctorProfile(doctorId) {
  return await Doctor.findById(doctorId).select("-password");
}

async function updateDoctorProfile(doctorId, updateData, fileUrl) {
  const allowedUpdates = [
    "name",
    "dob",
    "gender",
    "specialization",
    "licenseNumber",
    "qualifications",
    "experience",
    "hospital",
    "consultationFee",
    "allowTelemedicine",
    "preferredLanguages",
    "aiInsightsEnabled",
  ];

  const filteredData = {};
  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      if (key === "qualifications" || key === "preferredLanguages") {
        if (typeof updateData[key] === "string") {
          try {
            filteredData[key] = JSON.parse(updateData[key]);
          } catch {
            filteredData[key] = updateData[key].split(",").map((s) => s.trim()).filter(Boolean);
          }
        } else if (Array.isArray(updateData[key])) {
          filteredData[key] = updateData[key];
        }
      } else {
        filteredData[key] = updateData[key];
      }
    }
  }

  if (fileUrl) {
    filteredData.profilePic = fileUrl;
  }

  return await Doctor.findByIdAndUpdate(
    doctorId,
    { $set: filteredData },
    { new: true, runValidators: true }
  ).select("-password");
}

async function getDoctorDashboardStats(doctor) {
  const doctorId = doctor._id;

  // 1. Fetch appointments for this doctor
  const appointments = await Appointment.find({ doctor: doctorId })
    .populate("patient", "name email profilePic uid bloodGroup dob gender")
    .populate("hospital", "name")
    .sort({ appointmentDate: 1, appointmentTime: 1 });

  // Categorize
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((apt) => {
    const aptDateStr = new Date(apt.appointmentDate).toISOString().split("T")[0];
    return aptDateStr === todayStr && apt.status !== "Cancelled";
  });

  const pendingRequests = appointments.filter((apt) => apt.status === "Requested");
  const upcomingAppointments = appointments.filter((apt) =>
    ["Pending", "Confirmed", "Rescheduled"].includes(apt.status)
  );
  const completedAppointments = appointments.filter((apt) => apt.status === "Completed");

  // Distinct patient IDs
  const patientIds = [
    ...new Set(
      appointments
        .filter((apt) => apt.patient && apt.patient._id)
        .map((apt) => apt.patient._id.toString())
    ),
  ];

  const totalPatientsCount = Math.max(patientIds.length, doctor.totalPatients || 0);

  // Recent consultations with clinical notes
  const recentConsultations = appointments
    .filter((apt) => apt.status === "Completed" || apt.diagnosis || apt.notes)
    .sort((a, b) => new Date(b.updatedAt || b.appointmentDate) - new Date(a.updatedAt || a.appointmentDate))
    .slice(0, 5);

  return {
    metrics: {
      todayCount: todayAppointments.length,
      pendingRequestsCount: pendingRequests.length,
      upcomingCount: upcomingAppointments.length,
      completedCount: completedAppointments.length,
      totalPatientsCount: totalPatientsCount,
      averageRating: doctor.averageRating || 4.9,
      consultationFee: doctor.consultationFee || 50,
      telemedicineAvailable: doctor.allowTelemedicine ?? true,
    },
    todayQueue: todayAppointments,
    pendingRequests: pendingRequests.slice(0, 5),
    upcomingQueue: upcomingAppointments.slice(0, 5),
    recentConsultations,
  };
}

async function getDoctorPatients(doctorId, searchQuery = "") {
  // Find all appointments for this doctor
  const appointments = await Appointment.find({ doctor: doctorId }).select("patient createdAt updatedAt status diagnosis notes prescription");
  
  const patientIdToApts = {};
  for (const apt of appointments) {
    if (apt.patient) {
      const pId = apt.patient.toString();
      if (!patientIdToApts[pId]) {
        patientIdToApts[pId] = [];
      }
      patientIdToApts[pId].push(apt);
    }
  }

  const patientIds = Object.keys(patientIdToApts);

  let filter = {};
  if (searchQuery && searchQuery.trim()) {
    const regex = new RegExp(searchQuery.trim(), "i");
    filter = {
      $or: [{ name: regex }, { email: regex }, { uid: regex }, { phone: regex }],
    };
  } else if (patientIds.length > 0) {
    filter = { _id: { $in: patientIds } };
  } else {
    // If no past appointments, return latest registered patients so doctor can browse/search
    filter = {};
  }

  const patients = await Patient.find(filter)
    .select("-password")
    .sort({ updatedAt: -1 })
    .limit(50);

  const sanitized = patients.map((pat) => {
    const clean = sanitizePatient(pat);
    const patApts = patientIdToApts[pat._id.toString()] || [];
    return {
      ...clean,
      consultationCount: patApts.length,
      lastConsultationDate: patApts.length > 0 ? patApts[patApts.length - 1].updatedAt : null,
      lastDiagnosis: patApts.find((a) => a.diagnosis)?.diagnosis || null,
    };
  });

  return sanitized;
}

async function getPatientDossier(patientId, doctorId) {
  const patient = await Patient.findById(patientId).select("-password");
  if (!patient) return null;

  const pastDoctorAppointments = await Appointment.find({
    patient: patientId,
    doctor: doctorId,
  })
    .populate("hospital", "name")
    .sort({ appointmentDate: -1 });

  return {
    patient: sanitizePatient(patient),
    appointmentHistory: pastDoctorAppointments,
  };
}

async function issuePrescription(doctorId, patientId, { appointmentId, medicationName, dosage, frequency, duration, instructions, fullPrescriptionText }) {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found");

  const doctor = await Doctor.findById(doctorId).select("name specialization");
  const doctorLabel = doctor ? `Dr. ${doctor.name} (${doctor.specialization})` : "Attending Doctor";

  let rxText = fullPrescriptionText;
  if (!rxText && medicationName) {
    rxText = `${medicationName} | Dosage: ${dosage || "Standard"} | Freq: ${frequency || "Once daily"} | Duration: ${duration || "5 days"} | Note: ${instructions || "As advised"} - Prescribed by ${doctorLabel} on ${new Date().toLocaleDateString()}`;
  } else if (rxText) {
    rxText = `${rxText} - Prescribed by ${doctorLabel} on ${new Date().toLocaleDateString()}`;
  }

  if (rxText) {
    patient.admin.prescriptions = patient.admin.prescriptions || [];
    patient.admin.prescriptions.unshift(rxText);
    await patient.save();
  }

  if (appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (appointment && appointment.doctor.toString() === doctorId.toString()) {
      appointment.prescription = rxText || appointment.prescription;
      await appointment.save();
    }
  }

  return {
    prescription: rxText,
    patient: sanitizePatient(patient),
  };
}

async function addClinicalNotes(doctorId, patientId, { appointmentId, diagnosis, notes, advice }) {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found");

  const doctor = await Doctor.findById(doctorId).select("name specialization");
  const doctorName = doctor ? `Dr. ${doctor.name}` : "Doctor";

  let combinedNote = "";
  if (diagnosis) combinedNote += `[Diagnosis]: ${diagnosis}\n`;
  if (notes) combinedNote += `[Clinical Notes]: ${notes}\n`;
  if (advice) combinedNote += `[Advice]: ${advice}\n`;
  combinedNote += `— Updated by ${doctorName} on ${new Date().toLocaleString()}`;

  patient.admin.doctorNotes = combinedNote;
  await patient.save();

  if (appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (appointment && appointment.doctor.toString() === doctorId.toString()) {
      if (diagnosis) appointment.diagnosis = diagnosis;
      if (notes || advice) appointment.notes = `${notes || ""} ${advice ? `\nAdvice: ${advice}` : ""}`.trim();
      await appointment.save();
    }
  }

  return {
    doctorNotes: combinedNote,
    patient: sanitizePatient(patient),
  };
}

async function getDoctorSettings(doctorId) {
  const doctor = await Doctor.findById(doctorId).select(
    "clinicHours teleconsultationSlots notificationPreferences preferredLanguages allowTelemedicine prescriptionTemplates commonMedications commonTests aiInsightsEnabled"
  );
  return doctor;
}

async function updateDoctorSettings(doctorId, settingsData) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return null;

  if (settingsData.clinicHours !== undefined) {
    doctor.clinicHours = settingsData.clinicHours;
  }
  if (settingsData.teleconsultationSlots !== undefined) {
    doctor.teleconsultationSlots = settingsData.teleconsultationSlots;
  }
  if (settingsData.allowTelemedicine !== undefined) {
    doctor.allowTelemedicine = Boolean(settingsData.allowTelemedicine);
  }
  if (settingsData.notificationPreferences !== undefined) {
    doctor.notificationPreferences = {
      ...doctor.notificationPreferences,
      ...settingsData.notificationPreferences,
    };
  }
  if (settingsData.preferredLanguages !== undefined) {
    doctor.preferredLanguages = settingsData.preferredLanguages;
  }
  if (settingsData.commonMedications !== undefined) {
    doctor.commonMedications = settingsData.commonMedications;
  }
  if (settingsData.commonTests !== undefined) {
    doctor.commonTests = settingsData.commonTests;
  }
  if (settingsData.aiInsightsEnabled !== undefined) {
    doctor.aiInsightsEnabled = settingsData.aiInsightsEnabled;
  }

  await doctor.save();
  return doctor;
}

module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorDashboardStats,
  getDoctorPatients,
  getPatientDossier,
  issuePrescription,
  addClinicalNotes,
  getDoctorSettings,
  updateDoctorSettings,
};
