import { Activity, Pill, CalendarClock, TestTube } from "lucide-react";

const iconMap = {
  appointment: CalendarClock,
  medication: Pill,
  vitals: Activity,
  lab: TestTube,
};

export default function HealthTimeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl border border-surface-100 bg-white p-6 shadow-soft dark:border-surface-800 dark:bg-surface-800">
        <h3 className="mb-6 text-lg font-bold text-surface-900 dark:text-white">Recent Activity</h3>
        <p className="text-sm text-surface-500">No recent activity available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-surface-100 bg-white p-6 shadow-soft dark:border-surface-800 dark:bg-surface-800">
      <h3 className="mb-6 text-lg font-bold text-surface-900 dark:text-white">Recent Activity</h3>
      <div className="relative ml-3 space-y-8 border-l-2 border-surface-100 dark:border-surface-700">
        {events.map((event, i) => {
          const Icon = iconMap[event.type] || Activity;
          return (
            <div key={i} className="relative pl-6">
              <span className="absolute -left-[17px] top-0.5 rounded-full border border-surface-200 bg-white p-1 dark:border-surface-600 dark:bg-surface-800">
                <Icon size={16} className="text-brand-500" />
              </span>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h4 className="font-semibold text-surface-900 dark:text-white">{event.title}</h4>
                <time className="text-xs font-medium text-surface-400">{event.date}</time>
              </div>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{event.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
