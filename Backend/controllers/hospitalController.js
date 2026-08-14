const Hospital = require("../models/Hospital");
const hospitalService = require("../services/hospitalService");

async function getProfile(req, res) {
  try {
    const profile = await hospitalService.getHospitalProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: "Hospital profile not found." });
    }
    return res.status(200).json({ profile });
  } catch (error) {
    console.error("Error fetching hospital profile:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const profile = await hospitalService.updateHospitalProfile(req.user.id, req.body);
    if (!profile) {
      return res.status(404).json({ message: "Hospital profile not found." });
    }
    return res.status(200).json({ message: "Hospital profile updated successfully.", profile });
  } catch (error) {
    console.error("Error updating hospital profile:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function updateBeds(req, res) {
  try {
    const { numberOfBeds } = req.body;
    const profile = await hospitalService.updateBedCount(req.user.id, numberOfBeds);
    if (!profile) {
      return res.status(404).json({ message: "Hospital not found." });
    }
    return res.status(200).json({ message: "Bed capacity updated successfully.", profile });
  } catch (error) {
    console.error("Error updating beds:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function getDashboard(req, res) {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }
    const dashboardData = await hospitalService.getHospitalDashboardStats(hospital);
    return res.status(200).json({ dashboard: dashboardData });
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function getDoctors(req, res) {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }
    const doctors = await hospitalService.getHospitalDoctors(
      hospital,
      req.query.search,
      req.query.filter,
      req.query.department
    );
    return res.status(200).json({ doctors });
  } catch (error) {
    console.error("Error fetching hospital doctors:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function updateDoctorStatus(req, res) {
  try {
    const { doctorId } = req.params;
    const { status } = req.body;
    const doctor = await hospitalService.updateDoctorStatus(doctorId, status);
    return res.status(200).json({ message: `Doctor status updated to ${status}.`, doctor });
  } catch (error) {
    console.error("Error updating doctor status:", error);
    return res.status(400).json({ message: error.message || "Failed to update doctor status." });
  }
}

async function assignDoctorDepartment(req, res) {
  try {
    const { doctorId } = req.params;
    const { department } = req.body;
    const doctor = await hospitalService.assignDoctorDepartment(doctorId, department);
    return res.status(200).json({ message: `Doctor assigned to ${department} department.`, doctor });
  } catch (error) {
    console.error("Error assigning doctor department:", error);
    return res.status(400).json({ message: error.message || "Failed to assign doctor department." });
  }
}

async function affiliateDoctor(req, res) {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }
    const doctor = await hospitalService.affiliateDoctor(hospital, req.params.doctorId);
    return res.status(200).json({ message: "Doctor affiliated with hospital successfully.", doctor });
  } catch (error) {
    console.error("Error affiliating doctor:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function onboardDoctor(req, res) {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }
    const doctor = await hospitalService.onboardDoctor(hospital, req.body);
    return res.status(201).json({ message: "Doctor onboarded successfully to hospital.", doctor });
  } catch (error) {
    console.error("Error onboarding doctor:", error);
    return res.status(400).json({ message: error.message || "Failed to onboard doctor." });
  }
}

async function getPatients(req, res) {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }
    const patients = await hospitalService.getHospitalPatients(hospital, req.query.search, req.query.filter);
    return res.status(200).json({ patients });
  } catch (error) {
    console.error("Error fetching hospital patients:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function admitPatient(req, res) {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }
    const patient = await hospitalService.admitPatient(hospital, req.body);
    return res.status(200).json({ message: "Patient admission record updated successfully.", patient });
  } catch (error) {
    console.error("Error admitting patient:", error);
    return res.status(400).json({ message: error.message || "Failed to record patient admission." });
  }
}

async function getDepartments(req, res) {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }
    const departments = await hospitalService.getHospitalDepartments(hospital);
    return res.status(200).json({ departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function getAppointments(req, res) {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }
    const appointments = await hospitalService.getHospitalAppointments(
      hospital,
      req.query.search,
      req.query.department,
      req.query.status
    );
    return res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function reassignAppointment(req, res) {
  try {
    const { appointmentId } = req.params;
    const { doctorId } = req.body;
    const appointment = await hospitalService.reassignHospitalAppointment(appointmentId, doctorId);
    return res.status(200).json({ message: "Appointment reassigned successfully.", appointment });
  } catch (error) {
    console.error("Error reassigning appointment:", error);
    return res.status(400).json({ message: error.message || "Failed to reassign appointment." });
  }
}

async function cancelAppointment(req, res) {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;
    const appointment = await hospitalService.cancelHospitalAppointment(appointmentId, reason);
    return res.status(200).json({ message: "Appointment cancelled by hospital.", appointment });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(400).json({ message: error.message || "Failed to cancel appointment." });
  }
}

async function getReports(req, res) {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }
    const reports = await hospitalService.getHospitalAnalytics(hospital);
    return res.status(200).json({ reports });
  } catch (error) {
    console.error("Error fetching hospital reports:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function getSettings(req, res) {
  try {
    const settings = await hospitalService.getHospitalSettings(req.user.id);
    if (!settings) {
      return res.status(404).json({ message: "Hospital settings not found." });
    }
    return res.status(200).json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function updateSettings(req, res) {
  try {
    const settings = await hospitalService.updateHospitalSettings(req.user.id, req.body.settings || req.body);
    if (!settings) {
      return res.status(404).json({ message: "Hospital settings not found." });
    }
    return res.status(200).json({ message: "Hospital settings updated successfully.", settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  updateBeds,
  getDashboard,
  getDoctors,
  updateDoctorStatus,
  assignDoctorDepartment,
  affiliateDoctor,
  onboardDoctor,
  getPatients,
  admitPatient,
  getDepartments,
  getAppointments,
  reassignAppointment,
  cancelAppointment,
  getReports,
  getSettings,
  updateSettings,
};
