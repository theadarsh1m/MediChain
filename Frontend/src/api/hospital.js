import client from "./client";

export async function fetchHospitalProfileRequest() {
  const response = await client.get("/hospital/profile");
  return response.data?.profile ?? null;
}

export async function updateHospitalProfileRequest(payload) {
  const response = await client.put("/hospital/profile", payload);
  return response.data?.profile ?? null;
}

export async function updateHospitalBedsRequest(numberOfBeds) {
  const response = await client.put("/hospital/beds", { numberOfBeds });
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

export async function fetchHospitalDoctorsRequest(search = "") {
  const params = search ? { search } : {};
  const response = await client.get("/hospital/doctors", { params });
  return response.data?.doctors ?? [];
}

export async function onboardDoctorRequest(payload) {
  const response = await client.post("/hospital/doctors/onboard", payload);
  return response.data?.doctor ?? null;
}

export async function affiliateDoctorRequest(doctorId) {
  const response = await client.post(`/hospital/doctors/${doctorId}/affiliate`);
  return response.data?.doctor ?? null;
}

export async function fetchHospitalPatientsRequest(search = "") {
  const params = search ? { search } : {};
  const response = await client.get("/hospital/patients", { params });
  return response.data?.patients ?? [];
}

export async function admitPatientRequest(payload) {
  const response = await client.post("/hospital/patients/admit", payload);
  return response.data?.patient ?? null;
}

export async function fetchHospitalDepartmentsRequest() {
  const response = await client.get("/hospital/departments");
  return response.data?.departments ?? [];
}

export async function fetchHospitalReportsRequest() {
  const response = await client.get("/hospital/reports");
  return response.data?.reports ?? null;
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
