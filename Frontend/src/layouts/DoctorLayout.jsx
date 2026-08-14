import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCircle2,
  Users2,
  X,
  Stethoscope,
} from "lucide-react";
import { Classic } from "@theme-toggles/react";
import "@theme-toggles/react/css/Classic.css";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import { getInitials } from "../lib/patient";
import { useDoctorStore } from "../store/doctorStore";

const mediChainLogo = "/medichain%20Icon.png";

const navItems = [
  { to: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "appointments", label: "Appointments", icon: Calendar },
  { to: "patients", label: "Patients EHR", icon: Users2 },
  { to: "profile", label: "Profile", icon: UserCircle2 },
  { to: "settings", label: "Settings", icon: Settings },
];

function getNavLinkClasses(isActive) {
  return `flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-blue-50 text-blue-700 dark:bg-emerald-500/12 dark:text-emerald-200"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100"
  }`;
}

function DoctorIdentity({ doctor }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 dark:bg-emerald-500/20 text-sm font-bold text-blue-700 dark:text-emerald-300">
          {doctor?.profilePic ? (
            <img src={doctor.profilePic} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            getInitials(doctor?.name) || "Dr"
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
            Dr. {doctor?.name || "Doctor"}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {doctor?.specialization || "Practitioner"}
          </p>
        </div>
      </div>
    </div>
  );
}

function SidebarLogout({ onLogout }) {
  return (
    <button
      onClick={onLogout}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
    >
      <LogOut size={16} />
      Log out
    </button>
  );
}

export default function DoctorLayout() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user: authDoctor, logout: handleLogout } = useAuth();
  const { profile, fetchProfile } = useDoctorStore();

  const doctor = profile || authDoctor;
  const currentItem = navItems.find((item) => location.pathname.includes(item.to)) || navItems[0];

  useEffect(() => {
    fetchProfile().catch(() => {});
  }, [fetchProfile]);

  useEffect(() => {
    setMobileNavOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile Drawer */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          />

          <div className="absolute left-0 top-0 flex h-full w-[88vw] max-w-xs flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-2xl transition-colors dark:border-slate-800 dark:bg-navbar-bg">
            <div className="mb-6 flex items-center justify-between gap-3">
              <Link to="/doctor/dashboard" className="flex items-center gap-3">
                <img
                  src={mediChainLogo}
                  alt="Logo"
                  className="h-11 w-11 rounded-2xl border border-slate-200 bg-white p-2 object-contain shadow-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500 dark:text-emerald-300">
                    MediChain
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Doctor Portal</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => getNavLinkClasses(isActive)}>
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto pt-6">
              <DoctorIdentity doctor={doctor} />
              <SidebarLogout onLogout={handleLogout} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Container */}
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Desktop Sidebar */}
        <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white/95 px-5 py-6 transition-colors dark:border-slate-800 dark:bg-navbar-bg/90 lg:sticky lg:top-0 lg:flex lg:flex-col">
          <div className="flex h-full flex-col">
            <div>
              <Link to="/doctor/dashboard" className="mb-8 flex items-center gap-3 px-2 transition-opacity hover:opacity-80">
                <img
                  src={mediChainLogo}
                  alt="Logo"
                  className="h-12 w-12 rounded-2xl border border-slate-200 bg-white p-2 object-contain shadow-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500 dark:text-emerald-300">
                    MediChain
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Doctor Portal</p>
                </div>
              </Link>

              <nav className="space-y-1.5">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => getNavLinkClasses(isActive)}>
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="mt-auto pt-6">
              <DoctorIdentity doctor={doctor} />
              <SidebarLogout onLogout={handleLogout} />
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-950/85">
            <div className="flex flex-col gap-3 px-4 py-2 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3 lg:items-center">
                  <button
                    type="button"
                    onClick={() => setMobileNavOpen(true)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
                  >
                    <Menu size={18} />
                  </button>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Doctor Portal</p>
                    <h1 className="mt-0.5 truncate text-xl font-bold text-slate-900 dark:text-slate-100">
                      {currentItem.label}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:justify-end">
                  {/* User Profile dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white p-1 pr-3.5 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 shadow-sm"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-emerald-500/20 dark:text-emerald-300 overflow-hidden">
                        {doctor?.profilePic ? (
                          <img src={doctor.profilePic} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          getInitials(doctor?.name) || "Dr"
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Dr. {doctor?.name?.split(" ")[0] || "Doctor"}
                      </span>
                    </button>

                    {dropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                        <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                          <Link
                            to="/doctor/profile"
                            className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            My Profile & Credentials
                          </Link>
                          <Link
                            to="/doctor/settings"
                            className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            Practice Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
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
                    className="shrink-0 text-3xl text-slate-600 transition-all dark:text-yellow-400"
                  />
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet context={{ doctor }} />
          </main>
        </div>
      </div>
    </div>
  );
}
