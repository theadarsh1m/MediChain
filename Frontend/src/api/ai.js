import client from "./client";

/**
 * Request an AI-generated health summary for the authenticated patient.
 * Identity is securely established via HTTP-only JWT cookies / headers.
 */
export async function fetchHealthSummaryRequest() {
  const response = await client.post("/api/ai/health-summary");
  return response.data?.data ?? response.data;
}
