import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import AdminDashboard from "./components/AdminDashboard";

// ✅ FIXED: standalone progress still points to student progress
import ProgressPage from "./components/pages/student/Progress";

// ✅ FIXED: point to EXISTING teacher enquiries file
// (kept ONLY to preserve original intent – still unused)
import TeacherEnquiries from "./components/pages/teacher/TeacherEnquiries";

const PrivateRoute = ({ children }) => {
  const isAuth = localStorage.getItem("isAuthenticated") === "true";
  const authToken = localStorage.getItem("authToken");

  return isAuth && authToken ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN + SIGNUP */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* DASHBOARD (single entry point – correct) */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Standalone Safe Route (kept) */}
        <Route
          path="/progress"
          element={
            <PrivateRoute>
              <ProgressPage />
            </PrivateRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
