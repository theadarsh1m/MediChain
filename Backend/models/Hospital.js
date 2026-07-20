const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    uid: { type: String, required: true, unique: true },
    address: String,
    numberOfBeds: Number,
    contactNumber: String,
    settings: {
      notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        app: { type: Boolean, default: true },
      },
      theme: { type: String, default: "light" },
      marketingEmails: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Hash password before saving
hospitalSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Hospital", hospitalSchema);
