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

export async function fetchHospitalDoctorsRequest(search = "", department = "") {
  const params = {};
  if (search) params.search = search;
  if (department && department !== "All") params.department = department;
  const response = await client.get("/hospital/doctors", { params });
  return response.data?.doctors ?? [];
}

export async function updateDoctorStatusRequest(doctorId, status) {
  const response = await client.put(`/hospital/doctors/${doctorId}/status`, { status });
  return response.data?.doctor ?? null;
}

export async function assignDoctorDepartmentRequest(doctorId, department) {
  const response = await client.put(`/hospital/doctors/${doctorId}/department`, { department });
  return response.data?.doctor ?? null;
}

export async function onboardDoctorRequest(payload) {
  const response = await client.post("/hospital/doctors/onboard", payload);
  return response.data?.doctor ?? null;
}

export async function affiliateDoctorRequest(doctorId) {
  const response = await client.post(`/hospital/doctors/${doctorId}/affiliate`);
  return response.data?.doctor ?? null;
}

export async function fetchHospitalPatientsRequest(search = "", filter = "all") {
  const params = {};
  if (search) params.search = search;
  if (filter) params.filter = filter;
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

export async function fetchHospitalAppointmentsRequest(search = "", department = "All", status = "All") {
  const params = {};
  if (search) params.search = search;
  if (department && department !== "All") params.department = department;
  if (status && status !== "All") params.status = status;
  const response = await client.get("/hospital/appointments", { params });
  return response.data?.appointments ?? [];
}

export async function reassignHospitalAppointmentRequest(appointmentId, doctorId) {
  const response = await client.put(`/hospital/appointments/${appointmentId}/reassign`, { doctorId });
  return response.data?.appointment ?? null;
}

export async function cancelHospitalAppointmentRequest(appointmentId, reason) {
  const response = await client.put(`/hospital/appointments/${appointmentId}/cancel`, { reason });
  return response.data?.appointment ?? null;
}

export async function fetchHospitalReportsRequest() {
  const response = await client.get("/hospital/reports");
  return response.data?.reports ?? null;
}

export async function fetchHospitalSettingsRequest() {
  const response = await client.get("/hospital/settings");
  return response.data?.settings ?? null;
}

export async function updateHospitalSettingsRequest(payload) {
  const response = await client.put("/hospital/settings", { settings: payload });
  return response.data?.settings ?? null;
}
