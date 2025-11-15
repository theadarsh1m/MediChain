import React, { useState } from "react";
import SignupForm from "../components/SignupForm";
import LoginForm from "../components/LoginForm";
import BackgroundDNA from "../components/BackgroundDNA";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

export default function SignupLoginPage() {
  const [mode, setMode] = useState("signup");
  const { isDark } = useTheme();

  return (
    // Change 1: Allow scrolling. We use min-h-screen instead of fixed inset-0 for the container content
    <div className={`relative min-h-screen w-full transition-colors duration-300 ${isDark ? 'dark bg-slate-950 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-black'}`}>
      
      <Navbar />

      {/* Background stays fixed so it doesn't scroll with the form */}
      <div className="fixed inset-0 z-0">
        {isDark && <BackgroundDNA />}
        {/* Overlay */}
        <div className={`absolute inset-0 transition-colors duration-300 ${isDark ? 'bg-black/60 backdrop-blur-[2px]' : 'bg-gradient-to-br from-blue-100/20 to-purple-100/20 backdrop-blur-[1px]'}`} />
      </div>

      {/* Modal Container - Centered but allows scrolling if height is too big */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 py-20">
        
        {/* The Card */}
        <div className={`w-full max-w-lg relative backdrop-blur-xl border p-8 rounded-3xl transition-colors duration-300 ${
          isDark 
            ? 'bg-neutral-900/80 border-white/10 shadow-2xl' 
            : 'bg-white border-blue-200/50 shadow-2xl drop-shadow-xl'
        }`}>
          
          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Buttons */}
              <div className={`rounded-full p-1 flex border transition-colors duration-300 ${
                isDark 
                  ? 'bg-black/40 border-white/5' 
                  : 'bg-gray-200/60 border-blue-300/30'
              }`}>
                <button
                  onClick={() => setMode("signup")}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
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
                  onClick={() => setMode("signin")}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
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

          {/* Dynamic Title */}
          <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            {mode === "signup" ? "Create an account" : "Welcome back"}
          </h1>
          <p className={`text-sm mb-6 transition-colors duration-300 ${
            isDark ? 'text-neutral-400' : 'text-gray-700'
          }`}>
             {mode === "signup" ? "Enter your details to get started." : "Please enter your details to sign in."}
          </p>

          {/* Render Form */}
          <div className={`transition-all duration-500 overflow-hidden ${
            mode === "signup" 
              ? 'slide-in-left' 
              : 'slide-in-right'
          }`}>
             {mode === "signup" ? <SignupForm /> : <LoginForm />}
          </div>

          {/* Footer Toggle Text */}
          <div className={`mt-6 text-center text-sm transition-colors duration-300 ${
            isDark ? 'text-neutral-500' : 'text-gray-700'
          }`}>
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("signin")} className={`font-semibold hover:underline ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className={`font-semibold hover:underline ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
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