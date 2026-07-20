import api from "./client"; // Central API instance

export const appointmentApi = {
  // Public endpoints
  getDoctors: async () => {
    const response = await api.get("/api/public/doctors");
    return response.data.doctors;
  },
  getHospitals: async () => {
    const response = await api.get("/api/public/hospitals");
    return response.data.hospitals;
  },

  // Appointment endpoints
  createAppointment: async (appointmentData) => {
    const response = await api.post("/api/appointments", appointmentData);
    return response.data.appointment;
  },
  getAppointments: async () => {
    const response = await api.get("/api/appointments");
    return response.data.appointments;
  },
  getAppointmentById: async (id) => {
    const response = await api.get(`/api/appointments/${id}`);
    return response.data.appointment;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/api/appointments/${id}/status`, { status });
    return response.data.appointment;
  },
  updateNotes: async (id, { notes, diagnosis, prescription }) => {
    const response = await api.put(`/api/appointments/${id}/notes`, { notes, diagnosis, prescription });
    return response.data.appointment;
  },
};
