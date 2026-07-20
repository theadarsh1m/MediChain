import client from "./client";

export async function fetchPatientProfileRequest() {
  const response = await client.get("/patient/profile");
  return response.data?.patient ?? null;
}

export async function updatePatientProfileRequest(payload) {
  const response = await client.patch("/patient/profile", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.patient ?? null;
}

export async function uploadReportRequest(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await client.post("/patient/action/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function addMedicationRequest(medData) {
  const response = await client.post("/patient/action/medication", medData);
  return response.data;
}

export async function bookVisitRequest(date) {
  const response = await client.post("/patient/action/book", { date });
  return response.data;
}
