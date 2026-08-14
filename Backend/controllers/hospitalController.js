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
    const stats = await hospitalService.getHospitalDashboardStats(hospital);
    return res.status(200).json({ dashboard: stats });
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function getStats(req, res) {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }
    const stats = await hospitalService.getDetailedStats(hospital);
    return res.status(200).json({ stats });
  } catch (error) {
    console.error("Error fetching detailed statistics:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
}

async function getDoctors(req, res) {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }
    const doctors = await hospitalService.getHospitalDoctors(hospital, req.query.search, req.query.filter);
    return res.status(200).json({ doctors });
  } catch (error) {
    console.error("Error fetching hospital doctors:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
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

async function getActivity(req, res) {
  try {
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }
    const activity = await hospitalService.getRecentActivity(hospital);
    return res.status(200).json({ activity });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
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
  getStats,
  getDoctors,
  affiliateDoctor,
  onboardDoctor,
  getPatients,
  admitPatient,
  getDepartments,
  getReports,
  getActivity,
  getSettings,
  updateSettings,
};
