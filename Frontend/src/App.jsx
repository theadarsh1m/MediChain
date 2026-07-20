import { useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import { loadUserFromStorage } from "./features/auth/authThunks";
import { useAppDispatch } from "./hooks/reduxHooks";
import { ThemeProvider } from "./context/ThemeContext";
import PatientLayout from "./layouts/PatientLayout";
import Home from "./pages/Home";
import Signup from "./pages/SignupLoginPage";
import ChatPage from "./pages/patient/ChatPage";
import CurrentHealthPage from "./pages/patient/CurrentHealthPage";
import DashboardPage from "./pages/patient/DashboardPage";
import DiagnosticsPage from "./pages/patient/DiagnosticsPage";
import MedicalHistoryPage from "./pages/patient/MedicalHistoryPage";
import ProfilePage from "./pages/patient/ProfilePage";
import SettingsPage from "./pages/patient/SettingsPage";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import PortalPlaceholder from "./pages/PortalPlaceholder";

function renderPatientRoutes() {
  return (
    <>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="medical-history" element={<MedicalHistoryPage />} />
      <Route path="current-health" element={<CurrentHealthPage />} />
      <Route path="medical" element={<Navigate to="../medical-history" replace />} />
      <Route path="diagnostics" element={<DiagnosticsPage />} />
      <Route path="chat" element={<ChatPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </>
  );
}

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_Backend_API_URL}/health`)
      .then(() => console.log("Backend is awake"))
      .catch(() => console.warn("Backend still waking up..."));
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Signup />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<RoleProtectedRoute allowedRoles={["patient"]} />}>
              <Route path="/patient" element={<PatientLayout />}>
                {renderPatientRoutes()}
              </Route>
              <Route path="/patient-portal" element={<PatientLayout />}>
                {renderPatientRoutes()}
              </Route>
            </Route>
            <Route element={<RoleProtectedRoute allowedRoles={["doctor"]} />}>
              <Route path="/doctor" element={<PortalPlaceholder title="Doctor Portal" />} />
            </Route>
            <Route element={<RoleProtectedRoute allowedRoles={["hospital"]} />}>
              <Route path="/hospital" element={<PortalPlaceholder title="Hospital Portal" />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
