import { AlertCircle } from "lucide-react";
import Button from "./Button";

export default function ErrorState({ message = "Something went wrong.", onRetry, retryLabel = "Retry" }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center transition-colors dark:border-rose-500/20 dark:bg-rose-500/5">
      <div className="mb-4 rounded-full bg-rose-100 p-3 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Error</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">{message}</p>
      {onRetry && (
        <Button variant="danger" onClick={onRetry} className="mt-4">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
