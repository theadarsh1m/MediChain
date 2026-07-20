import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import GoogleLoginButton from "./auth/GoogleLoginButton";
import RoleSelector from "./RoleSelector";

export default function SignupForm() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { loading, error, signup } = useAuth();
  const [role, setRole] = useState("patient");
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

  const handle = (event) => {
    setData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    const payload = {
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      password: data.password,
      dob: data.dob,
      gender: data.gender,
      role,
      ...(role === "doctor"
        ? {
            specialization: data.specialization,
            licenseNumber: data.licenseNumber,
          }
        : {}),
    };

    try {
      const response = await signup(payload);
      
      navigate(response.redirectTo || "/patient");
      toast.success("Account created successfully.");
    } catch (message) {
      if (message && message.toLowerCase().includes("exists")) {
        toast.error("Email already exists.");
      } else {
        toast.error(message || "Unable to complete signup.");
      }
    }
  };

  return (
    <>
      <RoleSelector role={role} setRole={setRole} />

      <form
        onSubmit={submit}
        className="animate-in fade-in slide-in-from-bottom-4 space-y-4 duration-500"
      >
        <div className="grid grid-cols-2 gap-4">
          <input
            name="firstName"
            onChange={handle}
            placeholder="First name"
            className={`rounded-xl border px-4 py-3 transition ${
              isDark
                ? "border-white/10 bg-black/30 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                : "border-blue-200/50 bg-white/60 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            }`}
            required
          />
          <input
            name="lastName"
            onChange={handle}
            placeholder="Last name"
            className={`rounded-xl border px-4 py-3 transition ${
              isDark
                ? "border-white/10 bg-black/30 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                : "border-blue-200/50 bg-white/60 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            }`}
            required
          />
        </div>

        <input
          name="email"
          type="email"
          onChange={handle}
          placeholder="Enter your email"
          className={`w-full rounded-xl border px-4 py-3 transition ${
            isDark
              ? "border-white/10 bg-black/30 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              : "border-blue-200/50 bg-white/60 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          }`}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            name="dob"
            type="date"
            onChange={handle}
            className={`rounded-xl border px-4 py-3 transition ${
              isDark
                ? "border-white/10 bg-black/30 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                : "border-blue-200/50 bg-white/60 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            }`}
            required
          />
          <select
            name="gender"
            onChange={handle}
            className={`rounded-xl border px-4 py-3 transition ${
              isDark
                ? "border-white/10 bg-black/30 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                : "border-blue-200/50 bg-white/60 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            }`}
            required
          >
            <option value="" className={isDark ? "bg-neutral-800" : "bg-white"}>
              Select Gender
            </option>
            <option value="Male" className={isDark ? "bg-neutral-800" : "bg-white"}>
              Male
            </option>
            <option
              value="Female"
              className={isDark ? "bg-neutral-800" : "bg-white"}
            >
              Female
            </option>
            <option value="Other" className={isDark ? "bg-neutral-800" : "bg-white"}>
              Other
            </option>
          </select>
        </div>

        <input
          name="password"
          type="password"
          onChange={handle}
          placeholder="Password"
          className={`w-full rounded-xl border px-4 py-3 transition ${
            isDark
              ? "border-white/10 bg-black/30 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              : "border-blue-200/50 bg-white/60 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          }`}
          required
        />

        {role === "doctor" ? (
          <div className="animate-in fade-in zoom-in-95 space-y-4 duration-300">
            <input
              name="specialization"
              onChange={handle}
              placeholder="Specialization"
              className={`w-full rounded-xl border px-4 py-3 transition ${
                isDark
                  ? "border-white/10 bg-black/30 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  : "border-blue-200/50 bg-white/60 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              }`}
              required
            />
            <input
              name="licenseNumber"
              onChange={handle}
              placeholder="License Number"
              className={`w-full rounded-xl border px-4 py-3 transition ${
                isDark
                  ? "border-white/10 bg-black/30 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  : "border-blue-200/50 bg-white/60 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              }`}
              required
            />
          </div>
        ) : null}

        <button
          disabled={loading}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3.5 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
            isDark
              ? "bg-white text-black hover:bg-neutral-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : null}
          {loading ? "Creating..." : "Create an account"}
        </button>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div
          className={`my-4 flex items-center gap-4 text-xs font-semibold uppercase tracking-widest ${
            isDark ? "text-neutral-500" : "text-gray-600"
          }`}
        >
          <div
            className={`h-px flex-1 ${
              isDark ? "bg-white/10" : "bg-blue-200/30"
            }`}
          />
          Or continue with
          <div
            className={`h-px flex-1 ${
              isDark ? "bg-white/10" : "bg-blue-200/30"
            }`}
          />
        </div>

        <GoogleLoginButton
          disabled={role !== "patient"}
          disabledText="Google sign-up is currently available for patients only."
        />
      </form>
    </>
  );
}
