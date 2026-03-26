import { CheckCircle2 } from "lucide-react";

export default function DashboardHeader({ patientName }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">
          Good morning, {patientName?.split(" ")[0] || "Patient"}
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Here is your health overview for today.
        </p>
      </div>
    </div>
  );
}
