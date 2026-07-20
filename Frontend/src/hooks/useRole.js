import { useAuth } from "./useAuth";

export function useRole() {
  const { user } = useAuth();
  return {
    role: user?.role ?? null,
    isPatient: user?.role === "patient",
    isDoctor: user?.role === "doctor",
    isHospital: user?.role === "hospital",
  };
}
