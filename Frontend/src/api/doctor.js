import client from "./client";

export async function fetchDoctorDashboardRequest() {
  const response = await client.get("/doctor/dashboard");
  return response.data?.dashboard ?? null;
}

export async function fetchDoctorProfileRequest() {
  const response = await client.get("/doctor/profile");
  return response.data?.profile ?? null;
}

export async function updateDoctorProfileRequest(payload) {
  let data = payload;
  let headers = {};

  if (payload instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  const response = await client.put("/doctor/profile", data, { headers });
  return response.data?.profile ?? null;
}

export async function fetchDoctorPatientsRequest(search = "") {
  const params = search ? { search } : {};
  const response = await client.get("/doctor/patients", { params });
  return response.data?.patients ?? [];
}

export async function fetchPatientDossierRequest(patientId) {
  const response = await client.get(`/doctor/patients/${patientId}`);
  return response.data?.dossier ?? null;
}

export async function completeConsultationRequest(payload) {
  const response = await client.post("/doctor/consultation/complete", payload);
  return response.data;
}

export async function issuePrescriptionRequest(patientId, payload) {
  const response = await client.post(`/doctor/patients/${patientId}/prescription`, payload);
  return response.data;
}

export async function addDoctorNotesRequest(patientId, payload) {
  const response = await client.post(`/doctor/patients/${patientId}/notes`, payload);
  return response.data;
}

export async function uploadToPatientRequest(patientId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await client.post(`/doctor/upload-to-patient/${patientId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function fetchDoctorSettingsRequest() {
  const response = await client.get("/doctor/settings");
  return response.data?.settings ?? null;
}

export async function updateDoctorSettingsRequest(payload) {
  const response = await client.put("/doctor/settings", payload);
  return response.data?.settings ?? null;
}
