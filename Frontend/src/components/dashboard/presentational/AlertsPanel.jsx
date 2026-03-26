import { useState, useEffect } from "react";
import { AlertCircle, Bell, Award, Loader2 } from "lucide-react";
import { generateSmartAlerts } from "../../../lib/gemini";

const iconMap = {
  warning: AlertCircle,
  info: Bell,
  success: Award,
};

const colorMap = {
  warning: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  success: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20",
};

export default function AlertsPanel({ patientData }) {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchAlerts() {
      if (!patientData) return;
      
      setIsLoading(true);
      try {
        const aiAlerts = await generateSmartAlerts(patientData);
        if (isMounted) {
          setAlerts(aiAlerts);
        }
      } catch (error) {
        console.error("Failed to load smart alerts", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchAlerts();
    
    return () => { isMounted = false; };
  }, [patientData]);

  return (
    <div className="rounded-2xl border border-surface-100 bg-white p-6 shadow-soft dark:border-surface-800 dark:bg-surface-800">
      <h3 className="mb-6 text-lg font-bold text-surface-900 dark:text-white">Smart Alerts</h3>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6 text-surface-400">
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-brand-500" />
            <p className="text-sm animate-pulse mt-2">Analyzing health data...</p>
          </div>
        ) : alerts.length > 0 ? (
          alerts.map((alert, i) => {
            const Icon = iconMap[alert.type] || Bell;
            const colorClass = colorMap[alert.type] || colorMap.info;
            
            return (
              <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 ${colorClass}`}>
                <Icon size={20} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium leading-relaxed">{alert.message}</p>
              </div>
            );
          })
        ) : (
          <div className="py-4 text-center text-sm text-surface-500">
            No smart alerts available at this time.
          </div>
        )}
      </div>
    </div>
  );
}
