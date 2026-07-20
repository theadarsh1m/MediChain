const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

async function getDoctors(req, res) {
  try {
    const doctors = await Doctor.find().select("name specialization profilePic averageRating totalPatients");
    return res.status(200).json({ doctors });
  } catch (error) {
    console.error("Get doctors error:", error);
    return res.status(500).json({ message: "Server error while fetching doctors." });
  }
}

async function getHospitals(req, res) {
  try {
    const hospitals = await Hospital.find().select("name email settings");
    return res.status(200).json({ hospitals });
  } catch (error) {
    console.error("Get hospitals error:", error);
    return res.status(500).json({ message: "Server error while fetching hospitals." });
  }
}

module.exports = {
  getDoctors,
  getHospitals,
};
