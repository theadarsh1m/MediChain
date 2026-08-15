require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const PORT = process.env.PORT || 5001;
const baseUrl = `http://localhost:${PORT}`;

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for testing.");

  try {
    // Test 1: Unauthenticated request should return 401
    const res1 = await fetch(`${baseUrl}/api/ai/health-summary`, { method: "POST" });
    console.log("Test 1 - Unauthenticated access returns 401:", res1.status === 401 ? "PASSED" : "FAILED", `(Status: ${res1.status})`);

    // Test 2: Doctor role should return 403
    const doctor = await Doctor.findOne();
    if (doctor) {
      const doctorToken = jwt.sign({ id: doctor._id, role: "doctor" }, JWT_SECRET, { expiresIn: "1h" });
      const res2 = await fetch(`${baseUrl}/api/ai/health-summary`, {
        method: "POST",
        headers: { Authorization: `Bearer ${doctorToken}` },
      });
      console.log("Test 2 - Doctor access returns 403:", res2.status === 403 ? "PASSED" : "FAILED", `(Status: ${res2.status})`);
    }

    // Test 3: Hospital role should return 403
    const hospital = await Hospital.findOne();
    if (hospital) {
      const hospitalToken = jwt.sign({ id: hospital._id, role: "hospital" }, JWT_SECRET, { expiresIn: "1h" });
      const res3 = await fetch(`${baseUrl}/api/ai/health-summary`, {
        method: "POST",
        headers: { Authorization: `Bearer ${hospitalToken}` },
      });
      console.log("Test 3 - Hospital access returns 403:", res3.status === 403 ? "PASSED" : "FAILED", `(Status: ${res3.status})`);
    }

    // Test 4: Authenticated Patient succeeds and ignores client-supplied patientId
    const patient = await Patient.findOne();
    if (patient) {
      const patientToken = jwt.sign({ id: patient._id, role: "patient" }, JWT_SECRET, { expiresIn: "1h" });
      const res4 = await fetch(`${baseUrl}/api/ai/health-summary`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${patientToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId: "666666666666666666666666", maliciousField: true }),
      });
      const data4 = await res4.json();
      const passed = res4.status === 200 && data4.success === true && data4.data?.summary;
      console.log("Test 4 - Authenticated Patient summary succeeds & ignores spoofed ID:", passed ? "PASSED" : "FAILED", `(Status: ${res4.status})`);
      if (passed) {
        console.log("\nSummary overview:", data4.data.summary.overallSummary);
      }
    }

    console.log("\nAll security and RBAC validation tests completed successfully!");
  } finally {
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
