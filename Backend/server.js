const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { connectToMongoDB } = require("./config/connect");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const patientRoute = require("./routes/patientRoute");
const doctorUploadRoute = require("./routes/doctorUploadRoute");

const app = express();

// CORS: support multiple origins (local dev + production)
const allowedOrigins = [
  process.env.Frontend_URL,
  "https://medichain.theadarsh.me",
  "https://medichainreal.netlify.app",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const PORT = process.env.PORT || 5001;

// Connect to MongoDB (cached for serverless warm starts)
const dbReady = connectToMongoDB(process.env.MONGO_URI);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/patient", patientRoute);
app.use("/doctor", doctorUploadRoute);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to MediVault API" });
});

app.get("/check-cookie", (req, res) => {
  console.log("Cookies ->", req.cookies);
  res.json({ cookies: req.cookies });
});

app.use((req, res) => {
  res.status(404).json({ message: "Page Not Found" });
});

// Only listen locally — Vercel handles HTTP in production
if (process.env.NODE_ENV !== "production") {
  dbReady
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to start server:", err.message);
      process.exit(1);
    });
}

module.exports = app;
