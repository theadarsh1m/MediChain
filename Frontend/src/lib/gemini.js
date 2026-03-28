import api from '../api/axios';

export async function generateSmartAlerts() {
  try {
    const response = await api.post("/patient/action/generate-alerts");
    return response.data.alerts;
  } catch (error) {
    console.error("Error generating smart alerts with backend:", error);
    return [
      { type: 'warning', message: "We couldn't generate your personalized insights right now. Please try again later." }
    ];
  }
}
