const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Hospital = require("../models/Hospital");

async function generateUniqueUID(role) {
  const normalized = (role || "").toLowerCase();
  let prefix = "USR";
  let count = 0;

  if (normalized === "doctor") {
    prefix = "DOC";
    count = await Doctor.countDocuments();
  } else if (normalized === "patient") {
    prefix = "PAT";
    count = await Patient.countDocuments();
  } else if (normalized === "hospital") {
    prefix = "HOS";
    count = await Hospital.countDocuments();
  }

  return `${prefix}-${Date.now()}-${count + 1}`;
}

module.exports = { generateUniqueUID };
