import { create } from "zustand";
import {
  fetchHospitalProfileRequest,
  updateHospitalProfileRequest,
  updateHospitalBedsRequest,
  fetchHospitalDashboardRequest,
  fetchHospitalDoctorsRequest,
  updateDoctorStatusRequest,
  assignDoctorDepartmentRequest,
  onboardDoctorRequest,
  affiliateDoctorRequest,
  fetchHospitalPatientsRequest,
  admitPatientRequest,
  fetchHospitalDepartmentsRequest,
  fetchHospitalAppointmentsRequest,
  reassignHospitalAppointmentRequest,
  cancelHospitalAppointmentRequest,
  fetchHospitalReportsRequest,
  fetchHospitalSettingsRequest,
  updateHospitalSettingsRequest,
} from "../api/hospital";

export const useHospitalStore = create((set, get) => ({
  profile: null,
  dashboard: null,
  doctors: [],
  patients: [],
  departments: [],
  appointments: [],
  reports: null,
  settings: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await fetchHospitalProfileRequest();
      set({ profile, loading: false });
      return profile;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch profile",
        loading: false,
      });
    }
  },

  updateProfile: async (payload) => {
    set({ loading: true, error: null });
    try {
      const profile = await updateHospitalProfileRequest(payload);
      set({ profile, loading: false });
      return profile;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to update profile",
        loading: false,
      });
      throw err;
    }
  },

  updateBeds: async (numberOfBeds) => {
    set({ loading: true, error: null });
    try {
      const profile = await updateHospitalBedsRequest(numberOfBeds);
      set((state) => ({
        profile: profile || state.profile,
        loading: false,
      }));
      get().fetchDashboard();
      return profile;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to update bed capacity",
        loading: false,
      });
      throw err;
    }
  },

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const dashboard = await fetchHospitalDashboardRequest();
      set({ dashboard, loading: false });
      return dashboard;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch dashboard",
        loading: false,
      });
    }
  },

  fetchDoctors: async (search = "", department = "") => {
    set({ loading: true, error: null });
    try {
      const doctors = await fetchHospitalDoctorsRequest(search, department);
      set({ doctors, loading: false });
      return doctors;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch doctors",
        loading: false,
      });
    }
  },

  updateDoctorStatus: async (doctorId, status) => {
    set({ loading: true, error: null });
    try {
      const doctor = await updateDoctorStatusRequest(doctorId, status);
      set((state) => ({
        doctors: state.doctors.map((d) => (d._id === doctorId ? { ...d, status } : d)),
        loading: false,
      }));
      get().fetchDashboard();
      return doctor;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to update doctor status",
        loading: false,
      });
      throw err;
    }
  },

  assignDoctorDepartment: async (doctorId, department) => {
    set({ loading: true, error: null });
    try {
      const doctor = await assignDoctorDepartmentRequest(doctorId, department);
      set((state) => ({
        doctors: state.doctors.map((d) =>
          d._id === doctorId ? { ...d, department, specialization: department } : d
        ),
        loading: false,
      }));
      get().fetchDashboard();
      return doctor;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to assign doctor department",
        loading: false,
      });
      throw err;
    }
  },

  onboardDoctor: async (payload) => {
    set({ loading: true, error: null });
    try {
      const doctor = await onboardDoctorRequest(payload);
      set((state) => ({
        doctors: [doctor, ...state.doctors],
        loading: false,
      }));
      get().fetchDashboard();
      return doctor;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to onboard doctor",
        loading: false,
      });
      throw err;
    }
  },

  affiliateDoctor: async (doctorId) => {
    set({ loading: true, error: null });
    try {
      const doctor = await affiliateDoctorRequest(doctorId);
      set((state) => ({
        doctors: state.doctors.map((d) => (d._id === doctorId ? doctor : d)),
        loading: false,
      }));
      get().fetchDashboard();
      return doctor;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to affiliate doctor",
        loading: false,
      });
      throw err;
    }
  },

  fetchPatients: async (search = "", filter = "all") => {
    set({ loading: true, error: null });
    try {
      const patients = await fetchHospitalPatientsRequest(search, filter);
      set({ patients, loading: false });
      return patients;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch patients",
        loading: false,
      });
    }
  },

  admitPatient: async (payload) => {
    set({ loading: true, error: null });
    try {
      const patient = await admitPatientRequest(payload);
      set((state) => ({
        patients: state.patients.map((p) => (p._id === patient._id ? patient : p)),
        loading: false,
      }));
      get().fetchDashboard();
      return patient;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to record patient admission",
        loading: false,
      });
      throw err;
    }
  },

  fetchDepartments: async () => {
    set({ loading: true, error: null });
    try {
      const departments = await fetchHospitalDepartmentsRequest();
      set({ departments, loading: false });
      return departments;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch departments",
        loading: false,
      });
    }
  },

  fetchAppointments: async (search = "", department = "All", status = "All") => {
    set({ loading: true, error: null });
    try {
      const appointments = await fetchHospitalAppointmentsRequest(search, department, status);
      set({ appointments, loading: false });
      return appointments;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch appointments",
        loading: false,
      });
    }
  },

  reassignAppointment: async (appointmentId, doctorId) => {
    set({ loading: true, error: null });
    try {
      const appointment = await reassignHospitalAppointmentRequest(appointmentId, doctorId);
      set((state) => ({
        appointments: state.appointments.map((a) => (a._id === appointmentId ? appointment : a)),
        loading: false,
      }));
      get().fetchDashboard();
      return appointment;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to reassign appointment",
        loading: false,
      });
      throw err;
    }
  },

  cancelAppointment: async (appointmentId, reason) => {
    set({ loading: true, error: null });
    try {
      const appointment = await cancelHospitalAppointmentRequest(appointmentId, reason);
      set((state) => ({
        appointments: state.appointments.map((a) => (a._id === appointmentId ? appointment : a)),
        loading: false,
      }));
      get().fetchDashboard();
      return appointment;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to cancel appointment",
        loading: false,
      });
      throw err;
    }
  },

  fetchReports: async () => {
    set({ loading: true, error: null });
    try {
      const reports = await fetchHospitalReportsRequest();
      set({ reports, loading: false });
      return reports;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch reports",
        loading: false,
      });
    }
  },

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await fetchHospitalSettingsRequest();
      set({ settings, loading: false });
      return settings;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch settings",
        loading: false,
      });
    }
  },

  updateSettings: async (payload) => {
    set({ loading: true, error: null });
    try {
      const settings = await updateHospitalSettingsRequest(payload);
      set({ settings, loading: false });
      return settings;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to update settings",
        loading: false,
      });
      throw err;
    }
  },
}));
