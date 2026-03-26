import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function MetricCard({ title, label, value, icon: Icon, trend, trendValue, helper, colorClass, accent }) {
  const isPositive = trend === "up";
  const displayTitle = title || label;
  
  // Handle backwards compatibility for accent string
  let mergedColorClass = colorClass || { bg: "bg-surface-50 dark:bg-surface-800", text: "text-surface-700 dark:text-surface-200" };
  if (accent) {
    const parts = accent.split(" ");
    mergedColorClass = { bg: parts[0], text: parts.slice(1).join(" ") };
  }
  
  return (
    <div className="group relative bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-soft hover:shadow-hover transition-all duration-300 border border-surface-100 dark:border-surface-800 overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        {Icon && (
          <div className={`p-3 rounded-xl ${mergedColorClass.bg} ${mergedColorClass.text}`}>
            <Icon size={24} strokeWidth={2} />
          </div>
        )}
        
        {trendValue && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-brand-600' : 'text-rose-600'}`}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-surface-500 dark:text-surface-400 text-sm font-medium mb-1">{displayTitle}</h3>
        <p className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">{value}</p>
        {helper && <p className="mt-2 text-xs text-surface-400 dark:text-surface-500">{helper}</p>}
      </div>
    </div>
  );
}
