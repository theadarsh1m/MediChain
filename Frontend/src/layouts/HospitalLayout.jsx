import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseMedical,
  Users2,
  CalendarDays,
  Building2,
  FileBarChart2,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Classic } from "@theme-toggles/react";
import "@theme-toggles/react/css/Classic.css";

import Loader from "../components/ui/Loader";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import { useHospitalStore } from "../store/hospitalStore";

const mediChainLogo = "/medichain%20Icon.png";

const navItems = [
  { to: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "doctors", label: "Doctors", icon: BriefcaseMedical },
  { to: "patients", label: "Patients", icon: Users2 },
  { to: "appointments", label: "Appointments", icon: CalendarDays },
  { to: "departments", label: "Departments", icon: Building2 },
  { to: "reports", label: "Reports", icon: FileBarChart2 },
  { to: "settings", label: "Settings", icon: Settings },
];

function getNavLinkClasses(isActive) {
  return `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-blue-50 text-blue-700 dark:bg-emerald-500/12 dark:text-emerald-200"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100"
  }`;
}

function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
      <span>Portal</span>
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        const label = path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");

        return (
          <span key={path} className="flex items-center gap-1">
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className={isLast ? "text-slate-600 dark:text-slate-300 font-semibold" : ""}>
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function HospitalIdentity({ hospital }) {
  const getInitials = (name) => {
    return name ? name.split(" ").slice(0, 2).map((n) => n[0].toUpperCase()).join("") : "H";
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
          {getInitials(hospital?.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {hospital?.name || "Hospital"}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {hospital?.email || "Email unavailable"}
          </p>
          {hospital?.uid && (
            <p className="mt-0.5 truncate text-[10px] font-mono font-bold uppercase tracking-wider text-blue-500 dark:text-emerald-400">
              {hospital.uid}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HospitalLayout() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { isAuthenticated, logout } = useAuth();
  const { fetchProfile, profile, loading, error } = useHospitalStore();

  useEffect(() => {
    if (isAuthenticated && !profile && !loading) {
      fetchProfile();
    }
  }, [isAuthenticated, profile, loading, fetchProfile]);

  useEffect(() => {
    setMobileNavOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const currentItem =
    navItems.find((item) => location.pathname.includes(item.to)) || navItems[0];

  const getInitials = (name) => {
    return name ? name.split(" ").slice(0, 2).map((n) => n[0].toUpperCase()).join("") : "H";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile Sidebar Slide Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          />

          <div className="absolute left-0 top-0 flex h-full w-[88vw] max-w-xs flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-2xl transition-colors dark:border-slate-800 dark:bg-navbar-bg">
            <div className="mb-6 flex items-center justify-between gap-3">
              <Link
                to="/hospital/dashboard"
                className="flex items-center gap-3 transition-opacity hover:opacity-80"
                onClick={() => setMobileNavOpen(false)}
              >
                <img
                  src={mediChainLogo}
                  alt="MediChain logo"
                  className="h-11 w-11 rounded-2xl border border-slate-200 bg-white p-2 object-contain shadow-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500 dark:text-emerald-300">
                    MediChain
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Hospital Portal</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => getNavLinkClasses(isActive)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto pt-6">
              <HospitalIdentity hospital={profile} />
              <button
                onClick={logout}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Main Container */}
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white/95 px-5 py-6 transition-colors dark:border-slate-800 dark:bg-navbar-bg/90 lg:sticky lg:top-0 lg:flex lg:flex-col">
          <div className="flex h-full flex-col">
            <div>
              <Link
                to="/hospital/dashboard"
                className="mb-8 flex items-center gap-3 px-2 transition-opacity hover:opacity-80"
              >
                <img
                  src={mediChainLogo}
                  alt="MediChain logo"
                  className="h-12 w-12 rounded-2xl border border-slate-200 bg-white p-2 object-contain shadow-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500 dark:text-emerald-300">
                    MediChain
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Hospital Portal</p>
                </div>
              </Link>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => getNavLinkClasses(isActive)}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="mt-auto pt-6">
              <HospitalIdentity hospital={profile} />
              <button
                onClick={logout}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div className="min-w-0 flex-1">
          {/* Sticky Header */}
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-950/85">
            <div className="flex flex-col gap-3 px-4 py-2 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3 lg:items-center">
                  <button
                    type="button"
                    onClick={() => setMobileNavOpen(true)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu size={18} />
                  </button>

                  <div className="min-w-0">
                    <Breadcrumbs />
                    <h1 className="mt-1 truncate text-2xl font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                      {currentItem.label}
                    </h1>
                  </div>
                </div>

                {/* Top bar Actions (User profile + Theme context toggle) */}
                <div className="flex items-center gap-3 sm:justify-end">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                        {getInitials(profile?.name)}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {profile?.name?.split(" ")[0] || "Hospital"}
                      </span>
                    </button>

                    {dropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                        <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                          <Link
                            to="/hospital/settings"
                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            Settings
                          </Link>
                          <button
                            onClick={logout}
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                          >
                            Log out
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <Classic
                    duration={750}
                    toggled={isDark}
                    onClick={toggleTheme}
                    className="shrink-0 text-3xl text-slate-600 transition-all dark:text-yellow-400 animate-in fade-in duration-300"
                    aria-label="Toggle theme"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="px-4 py-6 sm:px-6 lg:px-8">
            {loading && !profile ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Loader label="Loading hospital profile..." />
              </div>
            ) : null}

            {error && !profile ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                <p>Failed to load profile. Please check your network connection.</p>
              </div>
            ) : null}

            {profile ? (
              <Outlet />
            ) : !loading && !error ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                Hospital profile not loaded.
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
