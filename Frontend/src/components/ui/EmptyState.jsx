// eslint-disable-next-line no-unused-vars
export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-200 bg-surface-50 p-12 text-center transition-colors dark:border-surface-700 dark:bg-surface-800/50">
      <div className="mb-4 rounded-full bg-surface-100 p-3 text-surface-400 dark:bg-surface-800 dark:text-surface-500">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-surface-500 dark:text-surface-400">{description}</p>
    </div>
  );
}
