import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/ui/Loader";

export default function RoleProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader label="Checking permissions..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "patient") {
      return <Navigate to="/patient" replace />;
    } else if (user.role === "doctor") {
      return <Navigate to="/doctor" replace />;
    } else if (user.role === "hospital") {
      return <Navigate to="/hospital" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
