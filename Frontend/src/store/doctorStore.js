import { create } from "zustand";
import {
  fetchDoctorDashboardRequest,
  fetchDoctorProfileRequest,
  updateDoctorProfileRequest,
  fetchDoctorPatientsRequest,
  fetchPatientDossierRequest,
  issuePrescriptionRequest,
  addDoctorNotesRequest,
  uploadToPatientRequest,
  fetchDoctorSettingsRequest,
  updateDoctorSettingsRequest,
} from "../api/doctor";

export const useDoctorStore = create((set, get) => ({
  profile: null,
  dashboard: null,
  patients: [],
  currentPatientDossier: null,
  settings: null,
  doctorStatus: "Available", // "Available" | "In Consultation" | "On Break" | "Offline"
  loading: false,
  error: null,

  setDoctorStatus: (status) => set({ doctorStatus: status }),

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await fetchDoctorProfileRequest();
      set({ profile, loading: false });
      return profile;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to load doctor profile";
      set({ error: msg, loading: false });
      throw error;
    }
  },

  updateProfile: async (payload) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateDoctorProfileRequest(payload);
      set({ profile: updated, loading: false });
      return updated;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update profile";
      set({ error: msg, loading: false });
      throw error;
    }
  },

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const dashboard = await fetchDoctorDashboardRequest();
      set({ dashboard, loading: false });
      return dashboard;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to load dashboard data";
      set({ error: msg, loading: false });
      throw error;
    }
  },

  fetchPatients: async (search = "") => {
    set({ loading: true, error: null });
    try {
      const patients = await fetchDoctorPatientsRequest(search);
      set({ patients, loading: false });
      return patients;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to load patient records";
      set({ error: msg, loading: false });
      throw error;
    }
  },

  fetchPatientDossier: async (patientId) => {
    set({ loading: true, error: null });
    try {
      const dossier = await fetchPatientDossierRequest(patientId);
      set({ currentPatientDossier: dossier, loading: false });
      return dossier;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to load patient dossier";
      set({ error: msg, loading: false });
      throw error;
    }
  },

  issuePrescription: async (patientId, payload) => {
    set({ loading: true, error: null });
    try {
      const res = await issuePrescriptionRequest(patientId, payload);
      // Refresh dashboard / dossier if active
      if (get().currentPatientDossier?.patient?._id === patientId) {
        set((state) => ({
          currentPatientDossier: {
            ...state.currentPatientDossier,
            patient: res.patient || state.currentPatientDossier.patient,
          },
        }));
      }
      set({ loading: false });
      return res;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to issue prescription";
      set({ error: msg, loading: false });
      throw error;
    }
  },

  addDoctorNotes: async (patientId, payload) => {
    set({ loading: true, error: null });
    try {
      const res = await addDoctorNotesRequest(patientId, payload);
      if (get().currentPatientDossier?.patient?._id === patientId) {
        set((state) => ({
          currentPatientDossier: {
            ...state.currentPatientDossier,
            patient: res.patient || state.currentPatientDossier.patient,
          },
        }));
      }
      set({ loading: false });
      return res;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to record clinical notes";
      set({ error: msg, loading: false });
      throw error;
    }
  },

  uploadToPatient: async (patientId, file) => {
    set({ loading: true, error: null });
    try {
      const res = await uploadToPatientRequest(patientId, file);
      set({ loading: false });
      return res;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to upload document";
      set({ error: msg, loading: false });
      throw error;
    }
  },

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await fetchDoctorSettingsRequest();
      set({ settings, loading: false });
      return settings;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to load doctor settings";
      set({ error: msg, loading: false });
      throw error;
    }
  },

  updateSettings: async (payload) => {
    set({ loading: true, error: null });
    try {
      const settings = await updateDoctorSettingsRequest(payload);
      set({ settings, loading: false });
      return settings;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update doctor settings";
      set({ error: msg, loading: false });
      throw error;
    }
  },
}));
