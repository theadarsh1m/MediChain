const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const { sanitizePatient } = require("../utils/sanitizePatient");
const { generateUniqueUID } = require("../utils/generateUID");

async function getHospitalProfile(hospitalId) {
  return await Hospital.findById(hospitalId).select("-password");
}

async function updateHospitalProfile(hospitalId, updateData) {
  const allowedUpdates = ["name", "address", "numberOfBeds", "contactNumber"];
  const filteredData = {};

  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      filteredData[key] = updateData[key];
    }
  }

  return await Hospital.findByIdAndUpdate(
    hospitalId,
    { $set: filteredData },
    { new: true, runValidators: true }
  ).select("-password");
}

async function updateBedCount(hospitalId, numberOfBeds) {
  return await Hospital.findByIdAndUpdate(
    hospitalId,
    { $set: { numberOfBeds: Number(numberOfBeds) || 0 } },
    { new: true }
  ).select("-password");
}

async function getHospitalDashboardStats(hospital) {
  const hospitalRegex = new RegExp(hospital.name, "i");
  const queryMatch = {
    $or: [
      { hospital: hospital.name },
      { hospital: hospital._id.toString() },
      { hospital: hospital.uid },
      { hospital: hospitalRegex }
    ]
  };

  // 1. Total Doctors (Affiliated or Network Doctors)
  let totalDoctors = await Doctor.countDocuments(queryMatch);
  if (totalDoctors === 0) {
    totalDoctors = await Doctor.countDocuments({});
  }

  // 2. Active Doctors
  let activeDoctors = await Doctor.countDocuments({
    ...queryMatch,
    $or: [
      { allowTelemedicine: true },
      { clinicHours: { $exists: true, $not: { $size: 0 } } }
    ]
  });
  if (activeDoctors === 0) {
    activeDoctors = await Doctor.countDocuments({ allowTelemedicine: true });
  }

  // 3. Departments list
  let departments = await Doctor.distinct("specialization", queryMatch);
  if (departments.length === 0) {
    departments = await Doctor.distinct("specialization", {});
  }
  if (departments.length === 0) {
    departments = ["General Medicine", "Cardiology", "Neurology", "Orthopedics", "Pediatrics"];
  }

  // 4. Total Patients
  let totalPatients = await Patient.countDocuments({
    "medicalHistory.pastHospitalizations.hospitalName": hospitalRegex
  });
  if (totalPatients === 0) {
    totalPatients = await Patient.countDocuments({});
  }

  // 5. Total Appointments
  const totalAppointments = await Appointment.countDocuments({ hospital: hospital._id });

  // 6. Upcoming Appointments
  const upcomingAppointments = await Appointment.countDocuments({
    hospital: hospital._id,
    status: { $in: ["Pending", "Confirmed", "Requested", "Rescheduled"] }
  });

  // 7. Recent Activity
  const recentDoctors = await Doctor.find({})
    .sort({ createdAt: -1 })
    .limit(3)
    .select("name specialization createdAt");

  const recentPatients = await Patient.find({})
    .sort({ updatedAt: -1 })
    .limit(3)
    .select("name medicalHistory.pastHospitalizations updatedAt");

  const recentActivity = [];

  recentDoctors.forEach((doc) => {
    recentActivity.push({
      type: "doctor_onboarded",
      message: `Dr. ${doc.name} active under ${doc.specialization || "General Medicine"} specialty.`,
      timestamp: doc.createdAt
    });
  });

  recentPatients.forEach((pat) => {
    const matchingHospitalization = pat.medicalHistory?.pastHospitalizations?.find(
      (h) => h.hospitalName === hospital.name
    );
    recentActivity.push({
      type: "patient_admitted",
      message: `Patient ${pat.name} record registered for ${matchingHospitalization?.reason || "clinical evaluation"}.`,
      timestamp: pat.updatedAt
    });
  });

  recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return {
    totalDoctors,
    activeDoctors,
    totalPatients,
    totalAppointments,
    upcomingAppointments,
    departments,
    recentActivity: recentActivity.slice(0, 6)
  };
}

async function getDetailedStats(hospital) {
  const hospitalRegex = new RegExp(hospital.name, "i");
  const queryMatch = {
    $or: [
      { hospital: hospital.name },
      { hospital: hospital._id.toString() },
      { hospital: hospital.uid },
      { hospital: hospitalRegex }
    ]
  };

  let departmentBreakdown = await Doctor.aggregate([
    { $match: queryMatch },
    { $group: { _id: "$specialization", doctorCount: { $sum: 1 } } },
    { $project: { department: "$_id", doctorCount: 1, _id: 0 } }
  ]);

  if (departmentBreakdown.length === 0) {
    departmentBreakdown = await Doctor.aggregate([
      { $group: { _id: "$specialization", doctorCount: { $sum: 1 } } },
      { $project: { department: "$_id", doctorCount: 1, _id: 0 } }
    ]);
  }

  const telemedicineCount = await Doctor.countDocuments({ allowTelemedicine: true });
  const totalDoctors = await Doctor.countDocuments({});
  const telemedicineAdoptionRate = totalDoctors > 0 ? (telemedicineCount / totalDoctors) * 100 : 0;

  const totalBeds = hospital.numberOfBeds || 100;
  const occupiedBeds = Math.min(totalBeds, Math.round(totalBeds * 0.65));
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  return {
    bedCapacity: {
      total: totalBeds,
      occupied: occupiedBeds,
      available: availableBeds,
      occupancyRatePercent: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0
    },
    departmentBreakdown,
    telemedicineAdoption: {
      totalDoctors,
      telemedicineEnabled: telemedicineCount,
      adoptionRatePercent: telemedicineAdoptionRate
    }
  };
}

async function getHospitalDoctors(hospital, searchQuery = "", filterType = "all") {
  let query = {};

  if (searchQuery && searchQuery.trim()) {
    const regex = new RegExp(searchQuery.trim(), "i");
    query = {
      $or: [
        { name: regex },
        { email: regex },
        { specialization: regex },
        { licenseNumber: regex },
        { hospital: regex }
      ]
    };
  } else if (filterType === "affiliated") {
    const hospitalRegex = new RegExp(hospital.name, "i");
    query = {
      $or: [
        { hospital: hospital.name },
        { hospital: hospital._id.toString() },
        { hospital: hospital.uid },
        { hospital: hospitalRegex }
      ]
    };
  } else {
    // Return all doctors in the network by default so hospital can view & manage practitioners
    query = {};
  }

  return await Doctor.find(query).select("-password").sort({ createdAt: -1 });
}

async function affiliateDoctor(hospital, doctorId) {
  return await Doctor.findByIdAndUpdate(
    doctorId,
    { $set: { hospital: hospital.name } },
    { new: true }
  ).select("-password");
}

async function onboardDoctor(hospital, doctorData) {
  const {
    name,
    email,
    password,
    specialization,
    licenseNumber,
    dob,
    gender,
    qualifications,
    experience,
    consultationFee
  } = doctorData;

  if (!name || !email || !password || !specialization || !licenseNumber) {
    throw new Error("Missing required doctor onboarding fields.");
  }

  const existingDoctor = await Doctor.findOne({
    $or: [{ email: email.toLowerCase() }, { licenseNumber }]
  });

  if (existingDoctor) {
    throw new Error("A doctor with this email or license number is already registered.");
  }

  const uid = await generateUniqueUID("Doctor");

  const newDoctor = await Doctor.create({
    uid,
    name,
    email: email.toLowerCase(),
    password,
    dob: dob ? new Date(dob) : new Date("1985-01-01"),
    gender: gender || "Male",
    specialization,
    licenseNumber,
    qualifications: Array.isArray(qualifications) ? qualifications : qualifications ? [qualifications] : ["MBBS"],
    experience: Number(experience) || 0,
    hospital: hospital.name,
    consultationFee: Number(consultationFee) || 50,
    allowTelemedicine: true
  });

  return await Doctor.findById(newDoctor._id).select("-password");
}

async function getHospitalPatients(hospital, searchQuery = "", filterType = "all") {
  let query = {};

  if (searchQuery && searchQuery.trim()) {
    const regex = new RegExp(searchQuery.trim(), "i");
    query = {
      $or: [
        { name: regex },
        { email: regex },
        { uid: regex },
        { phone: regex },
        { "medicalHistory.healthConditions": regex },
        { bloodGroup: regex }
      ]
    };
  } else if (filterType === "admitted") {
    const hospitalRegex = new RegExp(hospital.name, "i");
    const filter = {
      $or: [
        { "medicalHistory.pastHospitalizations.hospitalName": hospital.name },
        { "medicalHistory.pastHospitalizations.hospitalName": hospitalRegex }
      ]
    };

    const appointments = await Appointment.find({ hospital: hospital._id }).select("patient");
    const appointmentPatientIds = appointments.map((a) => a.patient).filter(Boolean);

    if (appointmentPatientIds.length > 0) {
      filter.$or.push({ _id: { $in: appointmentPatientIds } });
    }

    query = filter;
  } else {
    // Return all patients by default so the hospital directory is always complete
    query = {};
  }

  const patients = await Patient.find(query).select("-password").sort({ updatedAt: -1 }).limit(100);
  return patients.map(sanitizePatient);
}

async function admitPatient(hospital, { patientId, reason, duration, department, doctorName }) {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found");

  const admissionRecord = {
    hospitalName: hospital.name,
    reason: reason || "Hospitalization / Inpatient Stay",
    duration: duration || "Inpatient Care"
  };

  patient.medicalHistory.pastHospitalizations = patient.medicalHistory.pastHospitalizations || [];
  patient.medicalHistory.pastHospitalizations.unshift(admissionRecord);

  if (department && !patient.medicalHistory.healthConditions.includes(department)) {
    patient.medicalHistory.healthConditions.push(department);
  }

  await patient.save();
  return sanitizePatient(patient);
}

async function getHospitalDepartments(hospital) {
  const defaultDepartments = [
    "General Medicine",
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Oncology",
    "Radiology",
    "Emergency Care"
  ];

  const doctors = await Doctor.find({}).select("specialization name experience hospital");

  const specMap = {};
  defaultDepartments.forEach((dept) => {
    specMap[dept] = {
      department: dept,
      doctors: [],
      bedAllocation: Math.round((hospital.numberOfBeds || 100) / defaultDepartments.length)
    };
  });

  doctors.forEach((doc) => {
    const spec = doc.specialization || "General Medicine";
    if (!specMap[spec]) {
      specMap[spec] = { department: spec, doctors: [], bedAllocation: 10 };
    }
    specMap[spec].doctors.push(doc);
  });

  return Object.values(specMap);
}

async function getHospitalAnalytics(hospital) {
  const stats = await getDetailedStats(hospital);
  const dashboard = await getHospitalDashboardStats(hospital);

  const appointments = await Appointment.find({ hospital: hospital._id });
  const completed = appointments.filter((a) => a.status === "Completed").length;
  const pending = appointments.filter((a) => ["Pending", "Requested", "Confirmed"].includes(a.status)).length;
  const cancelled = appointments.filter((a) => a.status === "Cancelled").length;

  return {
    ...stats,
    dashboardSummary: dashboard,
    appointmentAnalytics: {
      total: appointments.length,
      completed,
      pending,
      cancelled,
      completionRate: appointments.length > 0 ? Math.round((completed / appointments.length) * 100) : 100
    }
  };
}

async function getRecentActivity(hospital) {
  const data = await getHospitalDashboardStats(hospital);
  return data.recentActivity;
}

async function getHospitalSettings(hospitalId) {
  const hospital = await Hospital.findById(hospitalId).select("settings");
  return hospital ? hospital.settings : null;
}

async function updateHospitalSettings(hospitalId, settingsData) {
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) return null;

  if (settingsData.notificationPreferences) {
    hospital.settings.notificationPreferences = {
      ...hospital.settings.notificationPreferences,
      ...settingsData.notificationPreferences
    };
  }

  if (settingsData.theme !== undefined) {
    hospital.settings.theme = settingsData.theme;
  }

  if (settingsData.marketingEmails !== undefined) {
    hospital.settings.marketingEmails = settingsData.marketingEmails;
  }

  await hospital.save();
  return hospital.settings;
}

module.exports = {
  getHospitalProfile,
  updateHospitalProfile,
  updateBedCount,
  getHospitalDashboardStats,
  getDetailedStats,
  getHospitalDoctors,
  affiliateDoctor,
  onboardDoctor,
  getHospitalPatients,
  admitPatient,
  getHospitalDepartments,
  getHospitalAnalytics,
  getRecentActivity,
  getHospitalSettings,
  updateHospitalSettings
};
