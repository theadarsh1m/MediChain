import { UploadCloud, Plus, CalendarPlus } from "lucide-react";

export default function QuickActions({ onUpload, onAddMedication, onBook }) {
  const actions = [
    { label: "Upload Report", icon: UploadCloud, onClick: onUpload, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400" },
    { label: "Add Medication", icon: Plus, onClick: onAddMedication, color: "text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400" },
    { label: "Book Visit", icon: CalendarPlus, onClick: onBook, color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400" },
  ];

  return (
    <div className="rounded-2xl border border-surface-100 bg-white p-6 shadow-soft dark:border-surface-800 dark:bg-surface-800">
      <h3 className="mb-4 text-lg font-bold text-surface-900 dark:text-white">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-700"
          >
            <div className={`rounded-lg p-2 transition-transform group-hover:scale-105 ${action.color}`}>
              <action.icon size={20} />
            </div>
            <span className="text-sm font-medium text-surface-700 dark:text-surface-200">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
