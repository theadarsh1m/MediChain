import clsx from "clsx";

export default function LoadingSpinner({ label = "Loading...", className = "" }) {
  return (
    <div className={clsx("flex flex-col items-center justify-center p-6 text-slate-500 dark:text-slate-400", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800 dark:border-t-emerald-400" />
      {label && <span className="mt-3 text-sm">{label}</span>}
    </div>
  );
}
