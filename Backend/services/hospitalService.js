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

  // 1. Core KPIs
  let totalDoctors = await Doctor.countDocuments({});
  let totalPatients = await Patient.countDocuments({});
  let totalAppointments = await Appointment.countDocuments({});
  let departments = await Doctor.distinct("specialization", {});
  if (departments.length === 0) {
    departments = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "ENT", "Dermatology", "General Medicine"];
  }

  // 2. Today's Appointments
  const todayStr = new Date().toISOString().split("T")[0];
  const allAppointments = await Appointment.find({})
    .populate("patient", "name uid email bloodGroup")
    .populate("doctor", "name specialization")
    .populate("hospital", "name")
    .sort({ appointmentDate: 1, appointmentTime: 1 });

  const todayAppointments = allAppointments.filter((apt) => {
    const aptDateStr = new Date(apt.appointmentDate).toISOString().split("T")[0];
    return aptDateStr === todayStr && apt.status !== "Cancelled";
  });

  // 3. Recent Registrations
  const recentDoctors = await Doctor.find({})
    .sort({ createdAt: -1 })
    .limit(4)
    .select("name specialization status createdAt profilePic");

  const recentPatients = await Patient.find({})
    .sort({ createdAt: -1 })
    .limit(4)
    .select("name uid email bloodGroup createdAt profilePic");

  // 4. Hospital & Doctor Activity
  const recentActivity = [];
  recentDoctors.forEach((doc) => {
    recentActivity.push({
      type: "doctor_registration",
      title: `Dr. ${doc.name} Registered`,
      description: `Practitioner registered under ${doc.specialization || "General Medicine"} department.`,
      timestamp: doc.createdAt,
      badge: doc.status || "Active"
    });
  });

  const admittedPatients = await Patient.find({
    "medicalHistory.pastHospitalizations": { $exists: true, $not: { $size: 0 } }
  })
    .sort({ updatedAt: -1 })
    .limit(4);

  admittedPatients.forEach((pat) => {
    const lastStay = pat.medicalHistory?.pastHospitalizations?.[0];
    recentActivity.push({
      type: "patient_admission",
      title: `Patient Admission: ${pat.name}`,
      description: `Admitted for ${lastStay?.reason || "Inpatient Care"} (${lastStay?.duration || "Care Ward"}).`,
      timestamp: pat.updatedAt,
      badge: "Inpatient"
    });
  });

  recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return {
    metrics: {
      doctorsCount: totalDoctors,
      patientsCount: totalPatients,
      appointmentsCount: totalAppointments,
      departmentsCount: departments.length,
      bedCapacity: hospital.numberOfBeds || 100,
    },
    todayAppointments: todayAppointments.slice(0, 10),
    recentDoctors,
    recentPatients,
    recentActivity: recentActivity.slice(0, 8),
    departments,
  };
}

async function getHospitalDoctors(hospital, searchQuery = "", filterType = "all", departmentFilter = "") {
  let query = {};

  if (searchQuery && searchQuery.trim()) {
    const regex = new RegExp(searchQuery.trim(), "i");
    query = {
      $or: [
        { name: regex },
        { email: regex },
        { specialization: regex },
        { department: regex },
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
  }

  if (departmentFilter && departmentFilter !== "All") {
    query.$or = [{ specialization: departmentFilter }, { department: departmentFilter }];
  }

  const doctors = await Doctor.find(query).select("-password").sort({ createdAt: -1 });

  // Calculate today's appointment load per doctor
  const todayStr = new Date().toISOString().split("T")[0];
  const allTodayApts = await Appointment.find({}).select("doctor appointmentDate status");

  const doctorAptsCount = {};
  allTodayApts.forEach((apt) => {
    if (apt.doctor) {
      const dId = apt.doctor.toString();
      const aptDateStr = new Date(apt.appointmentDate).toISOString().split("T")[0];
      if (aptDateStr === todayStr && apt.status !== "Cancelled") {
        doctorAptsCount[dId] = (doctorAptsCount[dId] || 0) + 1;
      }
    }
  });

  return doctors.map((doc) => {
    const dObj = doc.toObject ? doc.toObject() : doc;
    return {
      ...dObj,
      department: doc.department || doc.specialization || "General Medicine",
      status: doc.status || "Active",
      appointmentsTodayCount: doctorAptsCount[doc._id.toString()] || 0,
      totalPatients: doc.totalPatients || 0,
    };
  });
}

async function updateDoctorStatus(doctorId, status) {
  const allowed = ["Active", "Suspended", "Pending Approval"];
  if (!allowed.includes(status)) throw new Error("Invalid doctor status");

  return await Doctor.findByIdAndUpdate(
    doctorId,
    { $set: { status } },
    { new: true }
  ).select("-password");
}

async function assignDoctorDepartment(doctorId, department) {
  if (!department) throw new Error("Department is required");

  return await Doctor.findByIdAndUpdate(
    doctorId,
    { $set: { department, specialization: department } },
    { new: true }
  ).select("-password");
}

async function affiliateDoctor(hospital, doctorId) {
  return await Doctor.findByIdAndUpdate(
    doctorId,
    { $set: { hospital: hospital.name, status: "Active" } },
    { new: true }
  ).select("-password");
}

async function onboardDoctor(hospital, doctorData) {
  const {
    name,
    email,
    password,
    specialization,
    department,
    licenseNumber,
    dob,
    gender,
    qualifications,
    experience,
    consultationFee
  } = doctorData;

  if (!name || !email || !password || (!specialization && !department) || !licenseNumber) {
    throw new Error("Missing required doctor onboarding fields.");
  }

  const existingDoctor = await Doctor.findOne({
    $or: [{ email: email.toLowerCase() }, { licenseNumber }]
  });

  if (existingDoctor) {
    throw new Error("A doctor with this email or license number is already registered.");
  }

  const uid = await generateUniqueUID("Doctor");
  const dept = department || specialization || "General Medicine";

  const newDoctor = await Doctor.create({
    uid,
    name,
    email: email.toLowerCase(),
    password,
    dob: dob ? new Date(dob) : new Date("1985-01-01"),
    gender: gender || "Male",
    specialization: dept,
    department: dept,
    status: "Active",
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
        { bloodGroup: regex }
      ]
    };
  } else if (filterType === "admitted") {
    const hospitalRegex = new RegExp(hospital.name, "i");
    query = {
      $or: [
        { "medicalHistory.pastHospitalizations.hospitalName": hospital.name },
        { "medicalHistory.pastHospitalizations.hospitalName": hospitalRegex }
      ]
    };
  }

  // Fetch appointments to find assigned doctors
  const appointments = await Appointment.find({}).populate("doctor", "name specialization").sort({ appointmentDate: -1 });
  const patientToDoctorMap = {};
  const patientAptCountMap = {};

  appointments.forEach((apt) => {
    if (apt.patient) {
      const pId = apt.patient.toString();
      patientAptCountMap[pId] = (patientAptCountMap[pId] || 0) + 1;
      if (!patientToDoctorMap[pId] && apt.doctor) {
        patientToDoctorMap[pId] = `Dr. ${apt.doctor.name} (${apt.doctor.specialization || "Physician"})`;
      }
    }
  });

  const patients = await Patient.find(query).select("-password").sort({ updatedAt: -1 }).limit(100);

  // Administrative Sanitization (Respecting patient clinical privacy)
  return patients.map((pat) => {
    const pObj = pat.toObject ? pat.toObject() : pat;
    return {
      _id: pObj._id,
      uid: pObj.uid,
      name: pObj.name,
      email: pObj.email,
      phone: pObj.phone,
      gender: pObj.gender,
      dob: pObj.dob,
      bloodGroup: pObj.bloodGroup,
      address: pObj.address,
      profilePic: pObj.profilePic,
      emergencyContact: pObj.emergencyContact,
      pastHospitalizations: pObj.medicalHistory?.pastHospitalizations || [],
      allergies: pObj.medicalHistory?.allergies || [],
      appointmentCount: patientAptCountMap[pObj._id.toString()] || 0,
      assignedDoctor: patientToDoctorMap[pObj._id.toString()] || "Unassigned",
      createdAt: pObj.createdAt,
      updatedAt: pObj.updatedAt,
    };
  });
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
    { name: "Cardiology", description: "Heart, vascular health, cardiac ICU, and surgical interventions.", headDoctor: "Dr. Rahul Sharma", activeStatus: "Active", bedAllocation: 25 },
    { name: "Neurology", description: "Brain, spine, nervous system diagnostics and therapy.", headDoctor: "Dr. Aman Verma", activeStatus: "Active", bedAllocation: 20 },
    { name: "Orthopedics", description: "Bone, joint replacement, sports injury, and trauma wing.", headDoctor: "Dr. Priya Singh", activeStatus: "Active", bedAllocation: 20 },
    { name: "Pediatrics", description: "Child health, neonatal ICU, and developmental medicine.", headDoctor: "Dr. Muskan Gupta", activeStatus: "Active", bedAllocation: 15 },
    { name: "ENT", description: "Ear, Nose, Throat, audiology, and head & neck clinical care.", headDoctor: "Dr. Abhay Kumar", activeStatus: "Active", bedAllocation: 10 },
    { name: "Dermatology", description: "Skin, allergy, and aesthetic dermatology care.", headDoctor: "Dr. Naman Kushwaha", activeStatus: "Active", bedAllocation: 8 },
    { name: "General Medicine", description: "Internal medicine, acute infections, preventive health, and diagnostics.", headDoctor: "Dr. Adarsh Sachan", activeStatus: "Active", bedAllocation: 30 },
    { name: "Emergency Care", description: "24/7 Level 1 Trauma Center, Resuscitation, and Critical Emergency ICU.", headDoctor: "Dr. Chief ER", activeStatus: "Active", bedAllocation: 20 }
  ];

  const doctors = await Doctor.find({}).select("name specialization department experience profilePic status");

  const deptMap = {};
  defaultDepartments.forEach((d) => {
    deptMap[d.name] = {
      ...d,
      doctors: [],
    };
  });

  doctors.forEach((doc) => {
    const deptName = doc.department || doc.specialization || "General Medicine";
    if (!deptMap[deptName]) {
      deptMap[deptName] = {
        name: deptName,
        description: `${deptName} clinical and diagnostic specialty wing.`,
        headDoctor: `Dr. ${doc.name}`,
        activeStatus: "Active",
        bedAllocation: 12,
        doctors: [],
      };
    }
    deptMap[deptName].doctors.push(doc);
    if (!deptMap[deptName].headDoctor || deptMap[deptName].headDoctor.includes("Dr.")) {
      deptMap[deptName].headDoctor = `Dr. ${doc.name}`;
    }
  });

  return Object.values(deptMap);
}

async function getHospitalAppointments(hospital, searchQuery = "", department = "All", status = "All") {
  const query = {};

  if (department && department !== "All") {
    // Look for doctors in this department
    const deptDoctors = await Doctor.find({
      $or: [{ specialization: department }, { department: department }]
    }).select("_id");
    const docIds = deptDoctors.map((d) => d._id);
    query.doctor = { $in: docIds };
  }

  if (status && status !== "All") {
    query.status = status;
  }

  const appointments = await Appointment.find(query)
    .populate("patient", "name uid email phone bloodGroup")
    .populate("doctor", "name specialization department profilePic")
    .populate("hospital", "name")
    .sort({ appointmentDate: -1, appointmentTime: 1 });

  let results = appointments;
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    results = appointments.filter((apt) => {
      const matchPatient = apt.patient?.name?.toLowerCase().includes(q) || apt.patient?.uid?.toLowerCase().includes(q);
      const matchDoctor = apt.doctor?.name?.toLowerCase().includes(q);
      const matchReason = apt.reason?.toLowerCase().includes(q);
      return matchPatient || matchDoctor || matchReason;
    });
  }

  return results;
}

async function reassignHospitalAppointment(appointmentId, newDoctorId) {
  const doctor = await Doctor.findById(newDoctorId);
  if (!doctor) throw new Error("Doctor not found");

  const appointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    { $set: { doctor: newDoctorId, status: "Confirmed" } },
    { new: true }
  ).populate("patient", "name uid").populate("doctor", "name specialization");

  return appointment;
}

async function cancelHospitalAppointment(appointmentId, cancelReason) {
  const appointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    {
      $set: {
        status: "Cancelled",
        cancelledAt: new Date(),
        notes: cancelReason ? `[Cancelled by Hospital Admin]: ${cancelReason}` : "Cancelled by Hospital Administration",
      },
    },
    { new: true }
  );

  return appointment;
}

async function getHospitalAnalytics(hospital) {
  const dashboard = await getHospitalDashboardStats(hospital);
  const appointments = await Appointment.find({});
  const completed = appointments.filter((a) => a.status === "Completed").length;
  const pending = appointments.filter((a) => ["Pending", "Requested", "Confirmed"].includes(a.status)).length;
  const cancelled = appointments.filter((a) => a.status === "Cancelled").length;

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
    appointmentAnalytics: {
      total: appointments.length,
      completed,
      pending,
      cancelled,
      completionRate: appointments.length > 0 ? Math.round((completed / appointments.length) * 100) : 100
    },
    dashboardSummary: dashboard
  };
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
  getHospitalDoctors,
  updateDoctorStatus,
  assignDoctorDepartment,
  affiliateDoctor,
  onboardDoctor,
  getHospitalPatients,
  admitPatient,
  getHospitalDepartments,
  getHospitalAppointments,
  reassignHospitalAppointment,
  cancelHospitalAppointment,
  getHospitalAnalytics,
  getHospitalSettings,
  updateHospitalSettings
};
