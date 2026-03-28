const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const patientSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    authProviders: {
      google: {
        firebaseUid: String,
        linkedAt: Date,
      },
    },

    // editable by patient
    profilePic: {
      type: String,
      default: "https://avatar.iran.liara.run/public/boy?username=Ash",
    },
    bloodGroup: String,
    address: String,
    phone: String,
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },

    medicalHistory: {
      surgicalProcedures: [String], // eg ["Appendectomy"]
      alcoholOrSmoking: String, //  "Occasional smoker"
      organHealth: String, //  "Liver issues"
      healthConditions: [String], //  ["Thyroid", "Diabetes"]
      allergies: [String], //  ["Penicillin"]
      vaccinationRecords: [String], //  ["COVID-19", "Tetanus"]
      pastHospitalizations: [
        { reason: String, duration: String, hospitalName: String },
      ],
    },

    currentHealth: {
      medications: [
        {
          name: String,
          dosage: String,
          timing: String,
        },
      ],
      exerciseRoutine: String,
      mentalHealthStatus: String,
    },

    diagnostics: {
      labReports: [String], // store URLs to uploaded reports
      organFunction: {
        liver: String,
        kidney: String,
        others: String,
      },
      immunizationReminders: [String],
    },

    aiSummary: {
      type: String, // Cache for generated AI summary
    },
    aiAlerts: [
      {
        type: { type: String, enum: ["info", "warning", "success"] },
        message: String,
      }
    ],

    admin: {
      doctorNotes: String,
      prescriptions: [String],
      nextAppointment: Date,
      insuranceDetails: String,
      medicalDocuments: [String],
      chatHistory: [
        {
          sender: String,
          message: String,
          timestamp: { type: Date, default: Date.now },
        },
      ],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Hash password before saving
patientSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Patient", patientSchema);
