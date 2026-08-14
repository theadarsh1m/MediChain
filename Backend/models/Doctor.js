const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const doctorSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },

    specialization: { type: String, required: true },
    licenseNumber: { type: String, unique: true, required: true },
    qualifications: [String],
    experience: Number,
    profilePic: {
      type: String,
      default: "https://avatar.iran.liara.run/public/",
    },

    // Availability & Schedule
    clinicHours: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    leaveDays: [Date],
    teleconsultationSlots: [
      {
        day: String,
        slots: [String],
      },
    ],

    // Practice Details
    hospital: String,
    department: String,
    status: {
      type: String,
      enum: ["Active", "Suspended", "Pending Approval"],
      default: "Active",
    },
    consultationFee: Number,
    signatureImage: String,

    // Communication Settings
    allowTelemedicine: { type: Boolean, default: true },
    preferredLanguages: [String],

    // Templates & Preferences
    prescriptionTemplates: [
      {
        name: String,
        template: Object,
      },
    ],
    commonMedications: [
      {
        name: String,
        defaultDosage: String,
      },
    ],
    commonTests: [String],

    // Statistics & Metrics
    totalPatients: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    appointmentStats: {
      completed: { type: Number, default: 0 },
      cancelled: { type: Number, default: 0 },
      rescheduled: { type: Number, default: 0 },
    },

    // Settings & Preferences
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      app: { type: Boolean, default: true },
    },
    aiInsightsEnabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Doctor", doctorSchema);
