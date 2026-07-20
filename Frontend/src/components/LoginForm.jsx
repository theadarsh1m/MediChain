import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import GoogleLoginButton from "./auth/GoogleLoginButton";

export default function LoginForm() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { loading, error, login } = useAuth();
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handle = (event) => {
    setData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    try {
      const response = await login(data);
      navigate(response.redirectTo || "/patient");
      toast.success("Login successful.");
    } catch (message) {
      toast.error(message || "Unable to complete login.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        name="email"
        onChange={handle}
        placeholder="Enter your email"
        className={`w-full rounded-lg border px-4 py-3 transition ${
          isDark
            ? "border-white/10 bg-black/30 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            : "border-blue-200/50 bg-white/60 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        }`}
        required
      />

      <input
        type="password"
        name="password"
        onChange={handle}
        placeholder="Password"
        className={`w-full rounded-lg border px-4 py-3 transition ${
          isDark
            ? "border-white/10 bg-black/30 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            : "border-blue-200/50 bg-white/60 text-black placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        }`}
        required
      />

      <button
        disabled={loading}
        className={`w-full cursor-pointer rounded-lg py-3 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
          isDark
            ? "bg-white text-black hover:bg-neutral-200"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div
        className={`my-4 flex items-center gap-4 text-sm font-semibold uppercase ${
          isDark ? "text-neutral-400" : "text-gray-600"
        }`}
      >
        <div
          className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-blue-200/30"}`}
        />
        OR CONTINUE WITH
        <div
          className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-blue-200/30"}`}
        />
      </div>

      <GoogleLoginButton />
    </form>
  );
}
