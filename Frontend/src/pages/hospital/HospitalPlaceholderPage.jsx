import PageHeader from "../../components/ui/PageHeader";

export default function HospitalPlaceholderPage({ title }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle="This portal section is currently under active development."
      />
      
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/50 transition-colors">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This dashboard feature is scheduled to launch in the next development phase of MediChain.
        </p>
      </div>
    </div>
  );
}
