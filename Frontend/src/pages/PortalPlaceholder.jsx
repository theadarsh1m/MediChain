import { useAuth } from "../hooks/useAuth";

export default function PortalPlaceholder({ title }) {
  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        {user && (
          <div className="mb-6 rounded-2xl bg-blue-50/50 dark:bg-slate-800/50 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Logged in as:</p>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-blue-500 dark:text-emerald-400 mt-2">
              Role: {user.role}
            </p>
          </div>
        )}
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
          Welcome to your portal dashboard. This section is currently under active development.
        </p>
        <button
          onClick={logout}
          className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white py-3 font-semibold transition"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
