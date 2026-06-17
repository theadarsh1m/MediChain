import DashboardHeader from "./DashboardHeader";
import MetricsGrid from "./MetricsGrid";
import HealthTimeline from "./HealthTimeline";
import AlertsPanel from "./AlertsPanel";
import QuickActions from "./QuickActions";
import AISummaryCard from "./AISummaryCard";

export default function DashboardUI({ 
  patientData, 
  isLoading, 
  onOpenUpload, 
  onOpenMedication, 
  onOpenBook 
}) {
  if (isLoading) {
    // Just a placeholder for actual skeleton
    return <div className="text-surface-500">Loading dashboard...</div>;
  }

  // Derived mock data to satisfy props based on patientData pattern
  const activeMeds = patientData?.admin?.prescriptions?.length || 0;
  const reportsCount = patientData?.diagnostics?.labReports?.length || 0;
  const docsCount = patientData?.admin?.medicalDocuments?.length || 0;
  
  // Calculate completion mock (just checking name + email + gender + etc)

  // Mock timeline events from prescriptions & reminders
  const timelineEvents = [
    { type: 'medication', title: 'New Prescription Added', date: 'Today, 9:00 AM', description: patientData?.admin?.prescriptions?.[0] || 'Paracetamol 500mg' },
    { type: 'appointment', title: 'Follow-up Scheduled', date: 'Yesterday', description: 'Next visit scheduled for upcoming week' },
    { type: 'lab', title: 'Lab Report Uploaded', date: '3 days ago', description: 'Complete Blood Count (CBC) results available' }
  ];

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DashboardHeader 
        patientName={patientData?.name} 
      />
      
      <div className="mb-6">
        <MetricsGrid 
          activeMedications={activeMeds}
          reportsUploaded={reportsCount}
          nextAppointmentDays={14}
          unreadNotes={docsCount}
        />
      </div>

      <AISummaryCard patientData={patientData} />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <AlertsPanel patientData={patientData} />
          <HealthTimeline events={timelineEvents} />
        </div>
        
        <div className="space-y-6">
          <QuickActions 
            onUpload={onOpenUpload}
            onAddMedication={onOpenMedication}
            onBook={onOpenBook}
          />
        </div>
      </div>
    </div>
  );
}
