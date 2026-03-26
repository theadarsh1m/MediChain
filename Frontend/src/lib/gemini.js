const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function generateSmartAlerts(patientData) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is missing. Returning default fallback alerts.");
    return [
      { type: 'warning', message: 'API Key missing. Unable to generate smart alerts.' },
      { type: 'info', message: 'Please add VITE_GEMINI_API_KEY to your frontend .env file.' }
    ];
  }

  // Create a minimal context object from patientData to keep the prompt concise and relevant
  const contextData = {
    age: patientData?.dob ? new Date().getFullYear() - new Date(patientData.dob).getFullYear() : 'Unknown',
    gender: patientData?.gender || 'Unknown',
    bloodGroup: patientData?.bloodGroup || 'Unknown',
    activePrescriptions: patientData?.admin?.prescriptions?.map(p => typeof p === 'string' ? p : p.medicationName) || [],
    recentLabs: patientData?.diagnostics?.labReports?.length || 0,
    upcomingAppointments: patientData?.admin?.appointments?.length || 0
  };

  const prompt = `You are an intelligent, empathetic medical assistant for a patient portal. 
Analyze the following patient context and generate exactly 3 personalized, concise health alerts or recommendations.
Keep each message under 2 sentences. 
Do not hallucinate severe conditions. Keep it supportive and preventive based on their data (like upcoming appointments, current prescriptions, age, etc). If there is little data, provide general preventive health nudges.

Respond ONLY with a valid JSON array of objects. Do not include markdown code blocks (\`\`\`json). The format must be exactly:
[
  {
    "type": "info" | "warning" | "success",
    "message": "The personalized alert text here."
  }
]

Patient Context:
${JSON.stringify(contextData)}
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 256,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      throw new Error("Empty response from Gemini");
    }

    const alerts = JSON.parse(textContent);
    
    if (Array.isArray(alerts)) {
      return alerts;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error generating smart alerts with Gemini:", error);
    return [
      { type: 'warning', message: "We couldn't generate your personalized insights right now. Please try again later." }
    ];
  }
}
