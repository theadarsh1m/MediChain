import { create } from "zustand";
import {
  fetchHospitalProfileRequest,
  updateHospitalProfileRequest,
  fetchHospitalDashboardRequest,
  fetchHospitalStatsRequest,
  fetchHospitalActivityRequest,
  fetchHospitalSettingsRequest,
  updateHospitalSettingsRequest,
} from "../api/hospital";

export const useHospitalStore = create((set) => ({
  profile: null,
  dashboard: null,
  stats: null,
  activity: [],
  settings: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await fetchHospitalProfileRequest();
      set({ profile, loading: false });
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

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const dashboard = await fetchHospitalDashboardRequest();
      set({ dashboard, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch dashboard",
        loading: false,
      });
    }
  },

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await fetchHospitalStatsRequest();
      set({ stats, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch stats",
        loading: false,
      });
    }
  },

  fetchActivity: async () => {
    set({ loading: true, error: null });
    try {
      const activity = await fetchHospitalActivityRequest();
      set({ activity, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch activity",
        loading: false,
      });
    }
  },

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await fetchHospitalSettingsRequest();
      set({ settings, loading: false });
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
