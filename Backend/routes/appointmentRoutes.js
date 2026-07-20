const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointmentNotes,
} = require("../controllers/appointmentController");

router.post("/", authMiddleware, createAppointment);
router.get("/", authMiddleware, getAppointments);
router.get("/:id", authMiddleware, getAppointmentById);
router.put("/:id/status", authMiddleware, updateAppointmentStatus);
router.put("/:id/notes", authMiddleware, updateAppointmentNotes);

module.exports = router;
