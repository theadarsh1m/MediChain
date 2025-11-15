import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShieldCheck } from "lucide-react";
import { Classic } from "@theme-toggles/react";
import "@theme-toggles/react/css/Classic.css";
import { LiquidButton } from "@/components/ui/shadcn-io/liquid-button";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar({ locoScrollRef }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { name: "Features", target: "#features" },
    { name: "How it Works", target: "#how-it-works" },
    { name: "Security", target: "#security" },
  ];

  const handleScrollTo = (target) => {
    setIsOpen(false);
    if (locoScrollRef.current) {
      locoScrollRef.current.scrollTo(target);
    }
  };

  function handleTheme() {
    toggleTheme();
  }

  return (
    <nav
      data-scroll-sticky
      data-scroll-target="#main-scroll-container"
      className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-navbar-bg/80 backdrop-blur-md transition-colors duration-300"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-white hover:opacity-80 transition-opacity"
            onClick={() => handleScrollTo("#")}
          >
            <ShieldCheck className="w-7 h-7" />
            <span className="tracking-tight">MediChain</span>
          </Link>

          {/*  DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                onClick={() => handleScrollTo(link.target)}
                className="text-sm font-medium text-gray-600 cursor-pointer transition-colors hover:text-blue-600 dark:text-text-for-dark dark:hover:text-greenish"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/*  RIGHT ACTIONs */}
          <div className="hidden md:flex items-center gap-4">
            <Classic
              duration={750}
              toggled={isDark}
              onClick={handleTheme}
              className="text-gray-600 dark:text-yellow-400 transition-all text-4xl flex items-center justify-center"
              aria-label="Toggle Theme"
            />

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>

            <Link
              to="/login"
              className="text-sm font-semibold text-gray-600 hover:text-blue-600 dark:text-text-for-dark dark:hover:text-white transition-colors"
            >
              Log in
            </Link>
            <LiquidButton className="dark:hover:text-white">
              <Link to="/signup">Sign Up</Link>
            </LiquidButton>
          </div>

          {/* 4. MOBILE TOGGLE */}
          <div className="flex items-center gap-4 md:hidden">
            <Classic
              duration={750}
              toggled={isDark}
              onClick={handleTheme}
              className="text-gray-600 dark:text-yellow-400 text-3xl flex items-center justify-center"
            />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 dark:text-white"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 5. MOBILE MENU dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-navbar-bg shadow-xl">
          <div className="flex flex-col p-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                onClick={() => handleScrollTo(link.target)}
                className="text-gray-600 font-medium hover:text-blue-600 dark:text-text-for-dark dark:hover:text-greenish"
              >
                {link.name}
              </a>
            ))}
            <hr className="border-gray-100 dark:border-gray-700" />
            <Link
              to="/login"
              className="text-center py-2 text-gray-600 font-semibold dark:text-text-for-dark"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-center py-2 bg-blue-600 text-white rounded-lg font-semibold dark:bg-greenish dark:text-navbar-bg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
