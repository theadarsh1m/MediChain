import clsx from "clsx";

export default function Card({ className = "", children }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-surface-100 bg-white p-6 shadow-soft hover:shadow-hover transition-all duration-300 dark:border-surface-800 dark:bg-surface-800",
        className
      )}
    >
      {children}
    </div>
  );
}
