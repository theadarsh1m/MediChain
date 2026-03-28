import api from "./axios";

export async function fetchPatientProfileRequest() {
  const response = await api.get("/patient/profile");
  return response.data?.patient ?? null;
}

export async function updatePatientProfileRequest(payload) {
  const response = await api.patch("/patient/profile", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.patient ?? null;
}

export async function generateAISummaryRequest(forceUpdate = false) {
  const response = await api.post("/patient/action/generate-summary", { forceUpdate });
  return response.data; // { summary: "...", patient: {...} }
}
