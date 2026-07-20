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
import AppointmentBookingPage from "./pages/patient/AppointmentBookingPage";
import AppointmentHistoryPage from "./pages/patient/AppointmentHistoryPage";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import PortalPlaceholder from "./pages/PortalPlaceholder";
import HospitalLayout from "./layouts/HospitalLayout";
import HospitalDashboardPage from "./pages/hospital/HospitalDashboardPage";
import HospitalPlaceholderPage from "./pages/hospital/HospitalPlaceholderPage";
import DoctorLayout from "./layouts/DoctorLayout";
import AppointmentQueuePage from "./pages/doctor/AppointmentQueuePage";
import AppointmentDetailsPage from "./pages/doctor/AppointmentDetailsPage";
import AppointmentTablePage from "./pages/hospital/AppointmentTablePage";

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
      <Route path="appointments" element={<AppointmentHistoryPage />} />
      <Route path="appointments/book" element={<AppointmentBookingPage />} />
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
              <Route path="/doctor" element={<DoctorLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<PortalPlaceholder title="Doctor Dashboard" />} />
                <Route path="appointments" element={<AppointmentQueuePage />} />
                <Route path="appointments/:id" element={<AppointmentDetailsPage />} />
                <Route path="profile" element={<PortalPlaceholder title="Doctor Profile" />} />
                <Route path="settings" element={<PortalPlaceholder title="Doctor Settings" />} />
              </Route>
            </Route>
            <Route element={<RoleProtectedRoute allowedRoles={["hospital"]} />}>
              <Route path="/hospital" element={<HospitalLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<HospitalDashboardPage />} />
                <Route path="doctors" element={<HospitalPlaceholderPage title="Doctors Management" />} />
                <Route path="patients" element={<HospitalPlaceholderPage title="Patients Management" />} />
                <Route path="appointments" element={<AppointmentTablePage />} />
                <Route path="departments" element={<HospitalPlaceholderPage title="Departments" />} />
                <Route path="reports" element={<HospitalPlaceholderPage title="Reports" />} />
                <Route path="settings" element={<HospitalPlaceholderPage title="Settings" />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
