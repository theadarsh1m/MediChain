import React, { useState } from "react";
import axios from "axios";
import { Chrome } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function LoginForm() {
  const API_URL = import.meta.env.VITE_Backend_API_URL;
  const { isDark } = useTheme();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handle = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/login`, data);
      alert("Login successful!");
    } catch (err) {
      alert(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        name="email"
        onChange={handle}
        placeholder="Enter your email"
        className={`w-full px-4 py-3 rounded-lg border transition ${
          isDark
            ? 'bg-black/30 border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            : 'bg-white/60 border-blue-200/50 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
        }`}
        required
      />

      <input
        type="password"
        name="password"
        onChange={handle}
        placeholder="Password"
        className={`w-full px-4 py-3 rounded-lg border transition ${
          isDark
            ? 'bg-black/30 border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            : 'bg-white/60 border-blue-200/50 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
        }`}
        required
      />

      <button className={`w-full py-3 rounded-lg font-medium transition-colors ${
        isDark
          ? 'bg-white text-black hover:bg-neutral-200'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}>
        Sign in
      </button>

      <div className={`flex items-center gap-4 my-4 text-sm uppercase font-semibold ${
        isDark ? 'text-neutral-400' : 'text-gray-600'
      }`}>
        <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-blue-200/30'}`} />
        OR CONTINUE WITH
        <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-blue-200/30'}`} />
      </div>

      <button
        type="button"
        className={`w-full py-3 rounded-lg border transition flex items-center justify-center gap-2 font-medium ${
          isDark
            ? 'bg-black/40 border-white/10 text-white hover:bg-white/5'
            : 'bg-white/50 border-blue-200/30 text-black hover:bg-blue-50'
        }`}
      >
        <Chrome size={18} />
        Google
      </button>
    </form>
  );
}

