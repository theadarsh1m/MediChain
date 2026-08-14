const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required but not set.");
}

// Helper to determine which collection a user belongs to based on role
function getRoleModel(role) {
  if (role === "patient") return Patient;
  if (role === "doctor") return Doctor;
  if (role === "hospital") return Hospital;
  return null;
}

// Generate unique ID
async function generateUID(role, Model) {
  const prefix = role === "patient" ? "PAT" : role === "doctor" ? "DOC" : "HOS";
  const count = await Model.countDocuments();
  return `${prefix}-${Date.now()}-${count + 1}`;
}

/**
 * GOOGLE AUTH CONTROLLER
 * POST /auth/google
 */
async function googleAuth(req, res) {
  try {
    const { name, email, firebaseUid, profilePic } = req.body;

    if (!email || !firebaseUid) {
      return res.status(400).json({ message: "Email and Firebase UID are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if user exists by email
    let patient = await Patient.findOne({ email: normalizedEmail });

    // 2. If NOT exists → create new patient
    if (!patient) {
      patient = await Patient.create({
        uid: await generateUID("patient", Patient),
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        profilePic: profilePic || "https://avatar.iran.liara.run/public/boy?username=Ash",
        // Store Google info in authProviders
        authProviders: {
          google: {
            firebaseUid: firebaseUid, // DO NOT store as password
            linkedAt: new Date(),
          },
        },
      });
    } else {
      // 3. If exists → Update auth providers if Google not linked
      if (!patient.authProviders?.google?.firebaseUid) {
        patient.authProviders = {
          ...patient.authProviders,
          google: {
            firebaseUid: firebaseUid,
            linkedAt: new Date(),
          },
        };
        await patient.save();
      }
    }

    // 4. Generate JWT payload: { id: user._id, role: "patient" }
    // expiry: 7d
    const token = jwt.sign(
      { id: patient._id, role: "patient" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Filter out password from response
    const userObj = patient.toObject();
    delete userObj.password;

    // 5. Return: { token, user }
    return res.status(200).json({
      message: "Google login successful",
      token,
      user: userObj,
      redirectTo: "/patient-portal/dashboard"
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({ message: "Unable to complete Google login." });
  }
}

/**
 * EMAIL SIGNUP CONTROLLER
 * POST /auth/signup
 */
async function signup(req, res) {
  try {
    const { name, email, password, role = "patient", dob, gender } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const Model = getRoleModel(role);

    // 1. Check if user already exists -> return 400 error
    const existingUser = await Model.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // 2. Else: create new user (password is hashed via pre-save hook in Schema)
    const user = await Model.create({
      uid: await generateUID(role, Model),
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      dob,
      gender,
    });

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user._id, role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userObj = user.toObject();
    delete userObj.password;

    // 4. Return: { token, user }
    return res.status(201).json({
      message: "User created successfully",
      token,
      user: userObj,
      redirectTo: role === "patient" ? "/patient-portal/dashboard" : "/"
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Unable to complete signup." });
  }
}

/**
 * EMAIL LOGIN CONTROLLER
 * POST /auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Find user by email (checking all collections)
    const user =
      (await Patient.findOne({ email: normalizedEmail })) ||
      (await Doctor.findOne({ email: normalizedEmail })) ||
      (await Hospital.findOne({ email: normalizedEmail }));

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // 2. Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const role = user.constructor.modelName.toLowerCase();

    // 3. Return JWT
    const token = jwt.sign(
      { id: user._id, role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userObj,
      redirectTo: role === "patient" ? "/patient-portal/dashboard" : "/"
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Unable to complete login." });
  }
}

module.exports = {
  googleAuth,
  signup,
  login,
};
