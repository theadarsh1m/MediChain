import clsx from "clsx";

export default function SkeletonLoader({ className, type = "rect" }) {
  return (
    <div
      className={clsx(
        "animate-pulse bg-surface-200 dark:bg-surface-700",
        type === "circle" ? "rounded-full" : "rounded-xl",
        className
      )}
    />
  );
}
