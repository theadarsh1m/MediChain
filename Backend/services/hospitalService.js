const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

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

async function getHospitalDashboardStats(hospital) {
  const queryMatch = {
    $or: [
      { hospital: hospital.name },
      { hospital: hospital._id.toString() },
      { hospital: hospital.uid }
    ]
  };

  // 1. Total Doctors
  const totalDoctors = await Doctor.countDocuments(queryMatch);

  // 2. Active Doctors (who allow telemedicine or have clinicHours listed)
  const activeDoctors = await Doctor.countDocuments({
    ...queryMatch,
    $or: [
      { allowTelemedicine: true },
      { clinicHours: { $exists: true, $not: { $size: 0 } } }
    ]
  });

  // 3. Departments list (unique specializations of hospital's doctors)
  const departments = await Doctor.distinct("specialization", queryMatch);

  // 4. Total Patients
  const doctors = await Doctor.find(queryMatch).select("totalPatients appointmentStats");
  const doctorSumPatients = doctors.reduce((acc, doc) => acc + (doc.totalPatients || 0), 0);

  // Patients listing hospital in pastHospitalizations
  const patientsWithPastHospitalizations = await Patient.countDocuments({
    "medicalHistory.pastHospitalizations.hospitalName": hospital.name
  });
  const totalPatients = Math.max(doctorSumPatients, patientsWithPastHospitalizations);

  // 5. Total Appointments (Sum of completed, cancelled, rescheduled stats on doctors)
  const totalAppointments = doctors.reduce((acc, doc) => {
    const stats = doc.appointmentStats || {};
    return acc + (stats.completed || 0) + (stats.cancelled || 0) + (stats.rescheduled || 0);
  }, 0);

  // 6. Upcoming Appointments
  const upcomingAppointments = await Patient.countDocuments({
    $or: [
      { "medicalHistory.pastHospitalizations.hospitalName": hospital.name }
    ],
    "admin.nextAppointment": { $gt: new Date() }
  });

  // 7. Recent Activity (latest doctor registrations and patient hospitalization updates)
  const recentDoctors = await Doctor.find(queryMatch)
    .sort({ createdAt: -1 })
    .limit(3)
    .select("name specialization createdAt");

  const recentPatients = await Patient.find({
    "medicalHistory.pastHospitalizations.hospitalName": hospital.name
  })
    .sort({ updatedAt: -1 })
    .limit(3)
    .select("name medicalHistory.pastHospitalizations updatedAt");

  const recentActivity = [];

  recentDoctors.forEach((doc) => {
    recentActivity.push({
      type: "doctor_onboarded",
      message: `Dr. ${doc.name} onboarded under ${doc.specialization} department.`,
      timestamp: doc.createdAt
    });
  });

  recentPatients.forEach((pat) => {
    const matchingHospitalization = pat.medicalHistory.pastHospitalizations.find(
      (h) => h.hospitalName === hospital.name
    );
    recentActivity.push({
      type: "patient_admitted",
      message: `Patient ${pat.name} record retrieved/admitted for ${matchingHospitalization?.reason || "consultation"}.`,
      timestamp: pat.updatedAt
    });
  });

  // Sort activities chronologically (newest first)
  recentActivity.sort((a, b) => b.timestamp - a.timestamp);

  return {
    totalDoctors,
    activeDoctors,
    totalPatients,
    totalAppointments,
    upcomingAppointments,
    departments,
    recentActivity: recentActivity.slice(0, 5)
  };
}

async function getDetailedStats(hospital) {
  const queryMatch = {
    $or: [
      { hospital: hospital.name },
      { hospital: hospital._id.toString() },
      { hospital: hospital.uid }
    ]
  };

  // Department breakdown (count of doctors per specialization)
  const departmentBreakdown = await Doctor.aggregate([
    { $match: queryMatch },
    { $group: { _id: "$specialization", doctorCount: { $sum: 1 } } },
    { $project: { department: "$_id", doctorCount: 1, _id: 0 } }
  ]);

  // Telemedicine adoption details
  const telemedicineCount = await Doctor.countDocuments({
    ...queryMatch,
    allowTelemedicine: true
  });
  const totalDoctors = await Doctor.countDocuments(queryMatch);
  const telemedicineAdoptionRate = totalDoctors > 0 ? (telemedicineCount / totalDoctors) * 100 : 0;

  // Bed capacity detailed statistics
  const totalBeds = hospital.numberOfBeds || 0;
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
  getHospitalDashboardStats,
  getDetailedStats,
  getRecentActivity,
  getHospitalSettings,
  updateHospitalSettings
};
