import api from '../api/axios';

export async function generateSmartAlerts(forceUpdate = false) {
  try {
    const response = await api.post("/patient/action/generate-alerts", { forceUpdate });
    return response.data.alerts;
  } catch (error) {
    console.error("Error generating smart alerts with backend:", error);
    return [
      { type: 'warning', message: "We couldn't generate your personalized insights right now. Please try again later." }
    ];
  }
}
