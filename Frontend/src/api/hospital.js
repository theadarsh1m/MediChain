import client from "./client";

export async function fetchHospitalProfileRequest() {
  const response = await client.get("/hospital/profile");
  return response.data?.profile ?? null;
}

export async function updateHospitalProfileRequest(payload) {
  const response = await client.put("/hospital/profile", payload);
  return response.data?.profile ?? null;
}

export async function fetchHospitalDashboardRequest() {
  const response = await client.get("/hospital/dashboard");
  return response.data?.dashboard ?? null;
}

export async function fetchHospitalStatsRequest() {
  const response = await client.get("/hospital/stats");
  return response.data?.stats ?? null;
}

export async function fetchHospitalActivityRequest() {
  const response = await client.get("/hospital/activity");
  return response.data?.activity ?? [];
}

export async function fetchHospitalSettingsRequest() {
  const response = await client.get("/hospital/settings");
  return response.data?.settings ?? null;
}

export async function updateHospitalSettingsRequest(payload) {
  const response = await client.put("/hospital/settings", { settings: payload });
  return response.data?.settings ?? null;
}
