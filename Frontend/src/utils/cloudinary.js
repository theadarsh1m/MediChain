import { uploadToPatientRequest } from "../api/doctor";

export async function uploadToCloudinary(file, patientId) {
  if (!file) throw new Error("No file provided");
  if (patientId) {
    const res = await uploadToPatientRequest(patientId, file);
    return res.fileUrl;
  }

  // If no patientId, upload via standard FormData
  const formData = new FormData();
  formData.append("file", file);

  // Fallback direct base64 reader if offline
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
