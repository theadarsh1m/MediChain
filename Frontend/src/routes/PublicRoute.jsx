import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PublicRoute() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.role === "doctor") {
      return <Navigate to="/doctor" replace />;
    }
    if (user?.role === "hospital") {
      return <Navigate to="/hospital" replace />;
    }
    return <Navigate to="/patient" replace />;
  }

  return <Outlet />;
}
