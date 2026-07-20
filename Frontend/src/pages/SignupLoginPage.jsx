import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SignupForm from "../components/SignupForm";
import LoginForm from "../components/LoginForm";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";
import Typewriter from "typewriter-effect";
import { Toaster } from "react-hot-toast";
import { GLASS_CARD_STYLES } from "../constants/styles";

const mediChainLogo = "/medichain%20Icon.png";
const signupTexts = [
  "Please sanitize your hands before signing up.",
  "Your health data will love its new home.",
  "Creating an account… this won’t hurt a bit (doctor’s classic lie).",
  "Enter details — we ran out of nurses to do it for you.",
];

const loginTexts = [
  "Please sanitize your hands before logging in.",
  "Welcome back — we missed you more than your doctor.",
  "Enter your password — we promise not to judge its strength.",
  "Warning: Wrong password may cause mild emotional damage.",
];

export default function SignupLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.pathname === "/login" ? "signin" : "signup";

  const { isDark } = useTheme();

  return (
    <div
      className={`relative min-h-screen w-full transition-colors duration-300 ${
        isDark
          ? "dark bg-slate-950 text-white"
          : "bg-linear-to-br from-blue-50 via-white to-purple-50 text-black"
      }`}
    >
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          duration: 4000,
          style: {
             background: isDark ? '#333' : '#fff',
             color: isDark ? '#fff' : '#000',
          }
        }}
      />
      <Navbar showMarketingLinks={false} showAuthActions={false} />

      <div className="fixed inset-0 z-0">
        <div
          className={`absolute inset-0 transition-colors duration-300 ${
            isDark
              ? "bg-black/60 backdrop-blur-[2px]"
              : "bg-linear-to-br from-blue-100/20 to-purple-100/20 backdrop-blur-[1px]"
          }`}
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 py-20">
        {/* Card */}
        <div
          className={GLASS_CARD_STYLES}
        >
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <img
                src={mediChainLogo}
                alt="MediChain logo"
                className="h-10 w-10 rounded-xl object-contain"
              />
              <div>
                <p
                  className={`text-lg font-bold transition-colors duration-300 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  MediChain
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {/* Toggle Buttons */}
              <div
                className={`rounded-full p-1 flex border transition-colors duration-300 ${
                  isDark
                    ? "bg-black/40 border-white/5"
                    : "bg-gray-200/60 border-blue-300/30"
                }`}
              >
                <button
                  onClick={() => navigate("/signup")}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                    mode === "signup"
                      ? isDark
                        ? "bg-white text-black shadow-lg"
                        : "bg-blue-600 text-white shadow-lg"
                      : isDark
                      ? "text-neutral-400 hover:text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Sign up
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                    mode === "signin"
                      ? isDark
                        ? "bg-white text-black shadow-lg"
                        : "bg-blue-600 text-white shadow-lg"
                      : isDark
                      ? "text-neutral-400 hover:text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>

          <h1
            className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            {mode === "signup" ? "Create an account" : "Welcome back"}
          </h1>
          <div
            className={`text-sm mb-6 transition-colors duration-300 ${
              isDark ? "text-neutral-400" : "text-gray-700"
            }`}
          >
            <Typewriter
              options={{
                strings: mode === "signup" ? signupTexts : loginTexts,
                delay: 40,
                deleteSpeed: 20,
                autoStart: true,
                loop: true,
                pauseFor: 2000,
              }}
            />
          </div>

          <div
            className={`transition-all duration-500 overflow-hidden ${
              mode === "signup" ? "slide-in-left" : "slide-in-right"
            }`}
          >
            {mode === "signup" ? <SignupForm /> : <LoginForm />}
          </div>

          <div
            className={`mt-6 text-center text-sm transition-colors duration-300 ${
              isDark ? "text-neutral-500" : "text-gray-700"
            }`}
          >
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className={`font-semibold hover:underline ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className={`font-semibold hover:underline ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
