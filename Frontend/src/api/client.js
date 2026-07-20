import axios from "axios";
import { getStoredToken } from "../features/auth/authStorage";

const client = axios.create({
  baseURL: import.meta.env.VITE_Backend_API_URL,
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let logoutCallback = null;

export const registerLogoutCallback = (callback) => {
  logoutCallback = callback;
};

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (logoutCallback) {
        logoutCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default client;
