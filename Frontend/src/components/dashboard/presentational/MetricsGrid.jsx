import { Pill, TestTube, CalendarClock, FileText } from "lucide-react";
import MetricCard from "../../ui/MetricCard";

export default function MetricsGrid({ activeMedications, reportsUploaded, nextAppointmentDays, unreadNotes }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard 
        title="Active Medications" 
        value={activeMedications || 0} 
        icon={Pill} 
        colorClass={{ bg: "bg-brand-50 dark:bg-brand-500/10", text: "text-brand-600 dark:text-brand-400" }}
      />
      <MetricCard 
        title="Reports Uploaded" 
        value={reportsUploaded || 0} 
        icon={TestTube} 
        trend="up"
        trendValue="+1 this week"
        colorClass={{ bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" }}
      />
      <MetricCard 
        title="Next Appointment" 
        value={nextAppointmentDays !== undefined ? `In ${nextAppointmentDays} days` : "None"} 
        icon={CalendarClock} 
        colorClass={{ bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" }}
      />
      <MetricCard 
        title="Unread Documents" 
        value={unreadNotes || 0} 
        icon={FileText} 
        colorClass={{ bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" }}
      />
    </div>
  );
}
