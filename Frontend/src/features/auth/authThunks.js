import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  loginWithCredentials as loginWithCredentialsRequest,
  loginWithGoogle as loginWithGoogleRequest,
  signupWithCredentials as signupWithCredentialsRequest,
} from "../../api/auth";
import { clearAuthSession, decorateUserWithTokenClaims, getStoredSession } from "./authStorage";

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

function buildAuthPayload(response) {
  if (!response?.token) {
    throw new Error("Authentication token missing from server response.");
  }

  return {
    user: decorateUserWithTokenClaims(response.user ?? null, response.token),
    token: response.token,
    isAuthenticated: true,
    redirectTo: response.redirectTo ?? "/patient",
  };
}

export const loadUserFromStorage = createAsyncThunk(
  "auth/loadUserFromStorage",
  async (_, { rejectWithValue }) => {
    try {
      return getStoredSession();
    } catch (error) {
      clearAuthSession();
      return rejectWithValue(
        getErrorMessage(error, "Unable to restore your session.")
      );
    }
  }
);

export const loginWithCredentials = createAsyncThunk(
  "auth/loginWithCredentials",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await loginWithCredentialsRequest(payload);
      return buildAuthPayload(response);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Unable to complete login."));
    }
  }
);

export const signupWithCredentials = createAsyncThunk(
  "auth/signupWithCredentials",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await signupWithCredentialsRequest(payload);
      return buildAuthPayload(response);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Unable to complete signup."));
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await loginWithGoogleRequest(payload);
      return buildAuthPayload(response);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to complete Google login.")
      );
    }
  }
);
