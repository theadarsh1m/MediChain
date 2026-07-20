export default function PageHeader({ title, subtitle, extra }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
      <div className="min-w-0">
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        <h1 className="mt-1 truncate text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h1>
      </div>
      {extra && <div className="flex items-center gap-3">{extra}</div>}
    </div>
  );
}
