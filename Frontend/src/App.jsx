import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/Home";
import Signup from "./pages/SignupLoginPage";

export default function App() {

  useEffect(() => {
    // Ping backend once to wake it up
    fetch(`${import.meta.env.VITE_Backend_API_URL}/health`)
      .then(() => console.log("Backend is awake"))
      .catch(() => console.warn("Backend still waking up..."));
  }, []);
  
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
