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
    const settings = await hospitalService.updateHospitalSettings(req.user.id, req.body.settings);
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
  getDashboard,
  getStats,
  getActivity,
  getSettings,
  updateSettings,
};
