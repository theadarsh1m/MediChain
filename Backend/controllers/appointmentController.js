const Appointment = require("../models/Appointment");

async function createAppointment(req, res) {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can book appointments." });
    }

    const { doctor, hospital, appointmentDate, appointmentTime, reason, symptoms, notes } = req.body;

    if (!doctor || !hospital || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor,
      hospital,
      appointmentDate,
      appointmentTime,
      reason,
      symptoms: symptoms || [],
      notes: notes || "",
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (error) {
    console.error("Create appointment error:", error);
    return res.status(500).json({ message: "Server error while creating appointment." });
  }
}

async function getAppointments(req, res) {
  try {
    let query = {};
    if (req.user.role === "patient") {
      query.patient = req.user.id;
    } else if (req.user.role === "doctor") {
      query.doctor = req.user.id;
    } else if (req.user.role === "hospital") {
      query.hospital = req.user.id;
    }

    const appointments = await Appointment.find(query)
      .populate("patient", "name email profilePic uid")
      .populate("doctor", "name specialization profilePic")
      .populate("hospital", "name")
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    return res.status(500).json({ message: "Server error while fetching appointments." });
  }
}

async function getAppointmentById(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name email profilePic uid dob gender")
      .populate("doctor", "name specialization profilePic")
      .populate("hospital", "name");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Verify ownership/access
    if (
      req.user.role === "patient" && appointment.patient._id.toString() !== req.user.id ||
      req.user.role === "doctor" && appointment.doctor._id.toString() !== req.user.id ||
      req.user.role === "hospital" && appointment.hospital._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    return res.status(200).json({ appointment });
  } catch (error) {
    console.error("Get appointment error:", error);
    return res.status(500).json({ message: "Server error while fetching appointment." });
  }
}

async function updateAppointmentStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Patients can only cancel their own appointments
    if (req.user.role === "patient") {
      if (appointment.patient.toString() !== req.user.id) {
        return res.status(403).json({ message: "Access denied." });
      }
      if (status !== "Cancelled") {
        return res.status(403).json({ message: "Patients can only cancel appointments." });
      }
    } else if (req.user.role === "doctor") {
      if (appointment.doctor.toString() !== req.user.id) {
        return res.status(403).json({ message: "Access denied." });
      }
    } else if (req.user.role === "hospital") {
      if (appointment.hospital.toString() !== req.user.id) {
        return res.status(403).json({ message: "Access denied." });
      }
    }

    appointment.status = status;
    if (status === "Completed") {
      appointment.completedAt = new Date();
    } else if (status === "Cancelled") {
      appointment.cancelledAt = new Date();
    }

    await appointment.save();
    return res.status(200).json({ message: "Status updated successfully", appointment });
  } catch (error) {
    console.error("Update appointment status error:", error);
    return res.status(500).json({ message: "Server error while updating status." });
  }
}

async function updateAppointmentNotes(req, res) {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can update notes." });
    }

    const { notes, diagnosis, prescription } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (notes !== undefined) appointment.notes = notes;
    if (diagnosis !== undefined) appointment.diagnosis = diagnosis;
    if (prescription !== undefined) appointment.prescription = prescription;

    await appointment.save();
    return res.status(200).json({ message: "Notes updated successfully", appointment });
  } catch (error) {
    console.error("Update appointment notes error:", error);
    return res.status(500).json({ message: "Server error while updating notes." });
  }
}

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointmentNotes,
};
