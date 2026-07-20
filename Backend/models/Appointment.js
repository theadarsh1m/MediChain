const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String, // e.g., "10:00 AM", "14:30"
      required: true,
    },
    duration: {
      type: Number, // duration in minutes, default 30
      default: 30,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    prescription: {
      type: String, // Can be a URL to an uploaded file or simple text
      trim: true,
    },
    attachments: [
      {
        type: String, // Array of URLs (images, documents)
      },
    ],
    status: {
      type: String,
      enum: ["Requested", "Pending", "Confirmed", "Rescheduled", "Completed", "Cancelled"],
      default: "Requested",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Could be Patient, Doctor, or Hospital who created the booking
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Virtual for checking if the appointment is in the past
appointmentSchema.virtual("isPast").get(function () {
  return this.appointmentDate < new Date();
});

// Indexes for faster querying
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ hospital: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
