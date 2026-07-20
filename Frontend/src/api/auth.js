import client from "./client";

export async function loginWithCredentials(payload) {
  const response = await client.post("/api/auth/login", payload);
  return response.data;
}

export async function signupWithCredentials(payload) {
  const response = await client.post("/api/auth/signup", payload);
  return response.data;
}

export async function loginWithGoogle(payload) {
  const response = await client.post("/api/auth/google", payload);
  return response.data;
}
