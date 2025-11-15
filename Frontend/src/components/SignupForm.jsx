import React, { useState } from "react";
import axios from "axios";
import RoleSelector from "./RoleSelector";
import { Loader2, Chrome } from "lucide-react"; // Icons
import { useTheme } from "../context/ThemeContext";

export default function SignupForm() {
  const API_URL = import.meta.env.VITE_Backend_API_URL;
  const { isDark } = useTheme();
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false); // Add loading state

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    specialization: "",
    licenseNumber: "",
  });

  const handle = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    const payload = {
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      password: data.password,
      dob: data.dob,
      gender: data.gender,
      role,
      ...(role === "doctor"
        ? { specialization: data.specialization, licenseNumber: data.licenseNumber }
        : {}),
    };

    try {
      await axios.post(`${API_URL}/auth/signup`, payload);
      alert("Account created!");
      // You might want to redirect here: window.location.href = '/dashboard';
    } catch (err) {
      alert(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <>
      <RoleSelector role={role} setRole={setRole} />

      <form onSubmit={submit} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-2 gap-4">
          <input
            name="firstName"
            onChange={handle}
            placeholder="First name"
            className={`px-4 py-3 rounded-xl border transition ${
              isDark
                ? 'bg-black/30 border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                : 'bg-white/60 border-blue-200/50 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            }`}
            required
          />
          <input
            name="lastName"
            onChange={handle}
            placeholder="Last name"
            className={`px-4 py-3 rounded-xl border transition ${
              isDark
                ? 'bg-black/30 border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                : 'bg-white/60 border-blue-200/50 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            }`}
            required
          />
        </div>

        <input
          name="email"
          type="email"
          onChange={handle}
          placeholder="Enter your email"
          className={`w-full px-4 py-3 rounded-xl border transition ${
            isDark
              ? 'bg-black/30 border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              : 'bg-white/60 border-blue-200/50 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          }`}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            name="dob"
            type="date"
            onChange={handle}
            className={`px-4 py-3 rounded-xl border transition ${
              isDark
                ? 'bg-black/30 border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                : 'bg-white/60 border-blue-200/50 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            }`}
            required
          />
          <select
            name="gender"
            onChange={handle}
            className={`px-4 py-3 rounded-xl border transition ${
              isDark
                ? 'bg-black/30 border-white/10 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                : 'bg-white/60 border-blue-200/50 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            }`}
            required
          >
            <option value="" className={isDark ? 'bg-neutral-800' : 'bg-white'}>Select Gender</option>
            <option value="Male" className={isDark ? 'bg-neutral-800' : 'bg-white'}>Male</option>
            <option value="Female" className={isDark ? 'bg-neutral-800' : 'bg-white'}>Female</option>
            <option value="Other" className={isDark ? 'bg-neutral-800' : 'bg-white'}>Other</option>
          </select>
        </div>

        <input
          name="password"
          type="password"
          onChange={handle}
          placeholder="Password"
          className={`w-full px-4 py-3 rounded-xl border transition ${
            isDark
              ? 'bg-black/30 border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              : 'bg-white/60 border-blue-200/50 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          }`}
          required
        />

        {role === "doctor" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <input
              name="specialization"
              onChange={handle}
              placeholder="Specialization"
              className={`w-full px-4 py-3 rounded-xl border transition ${
                isDark
                  ? 'bg-black/30 border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  : 'bg-white/60 border-blue-200/50 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              }`}
              required
            />
            <input
              name="licenseNumber"
              onChange={handle}
              placeholder="License Number"
              className={`w-full px-4 py-3 rounded-xl border transition ${
                isDark
                  ? 'bg-black/30 border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  : 'bg-white/60 border-blue-200/50 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              }`}
              required
            />
          </div>
        )}

        <button 
          disabled={loading}
          className={`w-full py-3.5 rounded-xl font-bold transition-colors disabled:opacity-70 flex justify-center items-center gap-2 ${
            isDark
              ? 'bg-white hover:bg-neutral-200 text-black'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? "Creating..." : "Create an account"}
        </button>

        <div className={`flex items-center gap-4 my-4 text-xs uppercase tracking-widest font-semibold ${
          isDark ? 'text-neutral-500' : 'text-gray-600'
        }`}>
          <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-blue-200/30'}`} />
          Or continue with
          <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-blue-200/30'}`} />
        </div>

        <button
          type="button"
          className={`w-full py-3 rounded-xl border transition flex items-center justify-center gap-2 font-medium ${
            isDark
              ? 'bg-black/40 border-white/10 text-white hover:bg-white/5'
              : 'bg-white/50 border-blue-200/30 text-black hover:bg-blue-50'
          }`}
        >
          <Chrome size={18} />
          Google
        </button>
      </form>
    </>
  );
}