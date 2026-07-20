import client from "./client";

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
