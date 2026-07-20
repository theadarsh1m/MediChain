import { create } from "zustand";
import { appointmentApi } from "../api/appointment";

export const useAppointmentStore = create((set) => ({
  appointments: [],
  currentAppointment: null,
  doctors: [],
  hospitals: [],
  loading: false,
  error: null,

  fetchPublicLists: async () => {
    set({ loading: true, error: null });
    try {
      const [doctors, hospitals] = await Promise.all([
        appointmentApi.getDoctors(),
        appointmentApi.getHospitals(),
      ]);
      set({ doctors, hospitals, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch doctors and hospitals", loading: false });
    }
  },

  fetchAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const appointments = await appointmentApi.getAppointments();
      set({ appointments, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch appointments", loading: false });
    }
  },

  fetchAppointmentById: async (id) => {
    set({ loading: true, error: null });
    try {
      const appointment = await appointmentApi.getAppointmentById(id);
      set({ currentAppointment: appointment, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to fetch appointment details", loading: false });
    }
  },

  createAppointment: async (data) => {
    set({ loading: true, error: null });
    try {
      const newAppointment = await appointmentApi.createAppointment(data);
      set((state) => ({
        appointments: [...state.appointments, newAppointment],
        loading: false,
      }));
      return newAppointment;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to create appointment", loading: false });
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const updated = await appointmentApi.updateStatus(id, status);
      set((state) => ({
        appointments: state.appointments.map((apt) => (apt._id === id ? updated : apt)),
        currentAppointment: state.currentAppointment?._id === id ? updated : state.currentAppointment,
        loading: false,
      }));
      return updated;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to update status", loading: false });
      throw error;
    }
  },

  updateNotes: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await appointmentApi.updateNotes(id, data);
      set((state) => ({
        appointments: state.appointments.map((apt) => (apt._id === id ? updated : apt)),
        currentAppointment: state.currentAppointment?._id === id ? updated : state.currentAppointment,
        loading: false,
      }));
      return updated;
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to update notes", loading: false });
      throw error;
    }
  },
}));
