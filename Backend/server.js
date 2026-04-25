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

app.use(
  cors({
    origin: process.env.Frontend_URL,
    credentials: true,
  })
);

const PORT = process.env.PORT || 5001;

connectToMongoDB(process.env.MONGO_URI);

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

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
