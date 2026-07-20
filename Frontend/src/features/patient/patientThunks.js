import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  fetchPatientProfileRequest,
  updatePatientProfileRequest,
} from "../../api/patient";
import { logout, setCredentials } from "../auth/authSlice";

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

function syncAuthUser(thunkApi, patient) {
  const authState = thunkApi.getState().auth;

  if (!authState.token || !patient) {
    return;
  }

  thunkApi.dispatch(
    setCredentials({
      token: authState.token,
      user: {
        ...(authState.user ?? {}),
        ...patient,
      },
    })
  );
}

function handleUnauthorized(thunkApi, error) {
  if (error?.response?.status === 401) {
    thunkApi.dispatch(logout());
  }
}

export const fetchPatientProfile = createAsyncThunk(
  "patient/fetchPatientProfile",
  async (_, thunkApi) => {
    try {
      const patient = await fetchPatientProfileRequest();
      syncAuthUser(thunkApi, patient);
      return patient;
    } catch (error) {
      handleUnauthorized(thunkApi, error);
      return thunkApi.rejectWithValue(
        getErrorMessage(error, "Unable to load patient profile.")
      );
    }
  },
  {
    condition: (options, { getState }) => {
      const state = getState();
      const force = Boolean(options?.force);

      if (!state.auth.isAuthenticated || !state.auth.token) {
        return false;
      }

      if (state.patient.loading) {
        return false;
      }

      if (!force && state.patient.data) {
        return false;
      }

      return true;
    },
  }
);

export const updatePatientProfile = createAsyncThunk(
  "patient/updatePatientProfile",
  async (payload, thunkApi) => {
    try {
      const patient = await updatePatientProfileRequest(payload);
      syncAuthUser(thunkApi, patient);
      return patient;
    } catch (error) {
      handleUnauthorized(thunkApi, error);
      return thunkApi.rejectWithValue(
        getErrorMessage(error, "Unable to update patient profile.")
      );
    }
  }
);
