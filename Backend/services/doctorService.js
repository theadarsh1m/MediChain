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
  const inProgressAppointments = appointments.filter((apt) => apt.status === "In Progress");
  const upcomingAppointments = appointments.filter((apt) =>
    ["Pending", "Confirmed", "Rescheduled", "In Progress"].includes(apt.status)
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
      inProgressCount: inProgressAppointments.length,
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
  // Find all appointments for this doctor to determine authorized patients
  const appointments = await Appointment.find({ doctor: doctorId }).select(
    "patient createdAt updatedAt status diagnosis notes prescription"
  );

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

  const authorizedPatientIds = Object.keys(patientIdToApts);

  let filter = {};
  if (searchQuery && searchQuery.trim()) {
    const regex = new RegExp(searchQuery.trim(), "i");
    // If searching by UID / email / name, allow lookup
    filter = {
      $or: [{ name: regex }, { email: regex }, { uid: regex }, { phone: regex }],
    };
  } else if (authorizedPatientIds.length > 0) {
    // Only return patients the doctor is authorized to treat
    filter = { _id: { $in: authorizedPatientIds } };
  } else {
    // If no past appointments yet, return empty list (enforcing doctor authorization scope)
    filter = { _id: { $in: [] } };
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
      isAuthorized: authorizedPatientIds.includes(pat._id.toString()),
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

async function completeConsultation(doctorId, { appointmentId, patientId, symptoms, vitals, diagnosis, notes, prescriptionsList, followUpDate, attachments }) {
  const doctor = await Doctor.findById(doctorId).select("name specialization");
  if (!doctor) throw new Error("Doctor not found");

  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found");

  // 1. Format Prescription
  let formattedRx = "";
  if (Array.isArray(prescriptionsList) && prescriptionsList.length > 0) {
    formattedRx = prescriptionsList
      .filter((item) => item.medicineName && item.medicineName.trim())
      .map((item, idx) => {
        return `${idx + 1}. ${item.medicineName} | Dosage: ${item.dosage || "Standard"} | Freq: ${item.frequency || "Once daily"} | Duration: ${item.duration || "As advised"} | Instructions: ${item.instructions || "After meals"}`;
      })
      .join("\n");
  }

  const doctorSignature = `Prescribed by Dr. ${doctor.name} (${doctor.specialization}) on ${new Date().toLocaleDateString()}`;
  const fullRxText = formattedRx ? `${formattedRx}\n— ${doctorSignature}` : "";

  // 2. Update Patient Vitals
  if (vitals && Object.keys(vitals).length > 0) {
    patient.currentHealth.vitals = {
      bloodPressure: vitals.bloodPressure || patient.currentHealth?.vitals?.bloodPressure,
      heartRate: vitals.heartRate || patient.currentHealth?.vitals?.heartRate,
      temperature: vitals.temperature || patient.currentHealth?.vitals?.temperature,
      weight: vitals.weight || patient.currentHealth?.vitals?.weight,
      spO2: vitals.spO2 || patient.currentHealth?.vitals?.spO2,
      recordedAt: new Date(),
    };
  }

  // 3. Update Patient Prescriptions
  if (fullRxText) {
    patient.admin.prescriptions = patient.admin.prescriptions || [];
    patient.admin.prescriptions.unshift(fullRxText);
  }

  // 4. Update Patient Past Consultations Record
  const consultationEntry = {
    doctorName: doctor.name,
    doctorSpecialization: doctor.specialization,
    date: new Date(),
    diagnosis: diagnosis || "Clinical Medical Consultation",
    notes: notes || "",
    prescription: fullRxText,
    vitals: vitals || {},
    followUpDate: followUpDate ? new Date(followUpDate) : null,
  };

  patient.admin.pastConsultations = patient.admin.pastConsultations || [];
  patient.admin.pastConsultations.unshift(consultationEntry);

  // 5. Update Health Conditions & Next Appointment
  if (diagnosis && !patient.medicalHistory.healthConditions.includes(diagnosis)) {
    patient.medicalHistory.healthConditions.push(diagnosis);
  }

  if (followUpDate) {
    patient.admin.nextAppointment = new Date(followUpDate);
  }

  // 6. Medical Documents / Reports
  if (Array.isArray(attachments) && attachments.length > 0) {
    patient.admin.medicalDocuments = patient.admin.medicalDocuments || [];
    patient.admin.medicalDocuments.push(...attachments);
  }

  // Save Patient EHR
  await patient.save();

  // 7. Update Appointment
  let updatedAppointment = null;
  if (appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (appointment && appointment.doctor.toString() === doctorId.toString()) {
      appointment.status = "Completed";
      appointment.completedAt = new Date();
      if (symptoms) appointment.symptoms = Array.isArray(symptoms) ? symptoms : [symptoms];
      if (vitals) appointment.vitals = vitals;
      if (diagnosis) appointment.diagnosis = diagnosis;
      if (notes) appointment.notes = notes;
      if (fullRxText) appointment.prescription = fullRxText;
      if (prescriptionsList) appointment.prescriptionsList = prescriptionsList;
      if (followUpDate) appointment.followUpDate = new Date(followUpDate);
      if (attachments) appointment.attachments = attachments;
      await appointment.save();
      updatedAppointment = appointment;
    }
  }

  // 8. Increment Doctor's Completed Consultations Count
  await Doctor.findByIdAndUpdate(doctorId, {
    $inc: { "appointmentStats.completed": 1, totalPatients: 1 },
  });

  return {
    appointment: updatedAppointment,
    patient: sanitizePatient(patient),
    consultation: consultationEntry,
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
  completeConsultation,
  issuePrescription,
  addClinicalNotes,
  getDoctorSettings,
  updateDoctorSettings,
};
