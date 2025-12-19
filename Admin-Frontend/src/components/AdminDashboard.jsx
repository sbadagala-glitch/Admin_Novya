// AdminDashboard.jsx (FINAL FIXED — ADMIN CAN VIEW ALL ROLES)
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { DashboardProvider } from "./DashboardContext";

// -------------------- STUDENT PAGES --------------------
import StudentOverview from "./pages/student/Overview";
import StudentPayments from "./pages/student/Payments";
import StudentProgress from "./pages/student/Progress";
import StudentFreeDemo from "./pages/student/Freedemo";
import StudentTickets from "./pages/student/Tickets";
import StudentEnquiries from "./pages/student/StudentEnquiries";
import StudentRegistrations from "./pages/student/Registrations";

// -------------------- PARENT PAGES --------------------
import ParentOverview from "./pages/parent/Overview";
import ParentEnquiries from "./pages/parent/ParentEnquiries";
import ParentPayments from "./pages/parent/Payments";
import ParentSupport from "./pages/parent/Support";
import ParentDemoRequests from "./pages/parent/DemoRequests";
import ParentRegistrations from "./pages/student/Registrations";

// -------------------- TEACHER PAGES --------------------
import TeacherOverview from "./pages/teacher/Overview";
import TeacherEnquiries from "./pages/teacher/TeacherEnquiries";
import TeacherDemoRequests from "./pages/teacher/DemoRequests";
import TeacherSupport from "./pages/teacher/Support";
import TeacherRegistrations from "./pages/teacher/Registrations";

// Redirect /dashboard/:role → /dashboard/:role/overview
const RoleRedirect = () => {
  const { role } = useParams();
  return <Navigate to={`/dashboard/${role}/overview`} replace />;
};

const InnerAdmin = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const titles = {
      overview: "Dashboard Overview",
      payments: "Payments",
      progress: "Progress",
      freedemo: "Free Demo",
      tickets: "Support Tickets",
      "student-enquiries": "Student Enquiries",
      "parent-enquiries": "Parent Enquiries",
      "teacher-enquiries": "Teacher Enquiries",
      registrations: "Registrations",
      support: "Support",
      demorequests: "Demo Requests",
    };

    const parts = location.pathname.split("/").filter(Boolean);
    const page = parts[2] || "overview";

    document.title = `${titles[page] || "Admin Dashboard"} | Prime Minds - Admin Panel`;
  }, [location.pathname]);

  return (
    <div className={`admin-dashboard ${darkMode ? "dark-mode" : ""}`}>
      <TopBar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showSidebar={showSidebar}
        toggleSidebar={() => setShowSidebar(!showSidebar)}
      />

      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />

      <main className="main-content">
        <Container fluid className="py-4">
          <Routes>
            <Route path=":role" element={<RoleRedirect />} />

            {/* STUDENT */}
            <Route path="student/overview" element={<StudentOverview />} />
            <Route path="student/payments" element={<StudentPayments />} />
            <Route path="student/progress" element={<StudentProgress />} />
            <Route path="student/freedemo" element={<StudentFreeDemo />} />
            <Route path="student/tickets" element={<StudentTickets />} />
            <Route path="student/student-enquiries" element={<StudentEnquiries />} />
            <Route path="student/registrations" element={<StudentRegistrations />} />

            {/* PARENT */}
            <Route path="parent/overview" element={<ParentOverview />} />
            <Route path="parent/parent-enquiries" element={<ParentEnquiries />} />
            <Route path="parent/payments" element={<ParentPayments />} />
            <Route path="parent/support" element={<ParentSupport />} />
            <Route path="parent/freedemo" element={<ParentDemoRequests />} />
            <Route path="parent/registrations" element={<ParentRegistrations />} />

            {/* TEACHER */}
            <Route path="teacher/overview" element={<TeacherOverview />} />
            <Route path="teacher/teacher-enquiries" element={<TeacherEnquiries />} />
            <Route path="teacher/demorequests" element={<TeacherDemoRequests />} />
            <Route path="teacher/support" element={<TeacherSupport />} />
            <Route path="teacher/registrations" element={<TeacherRegistrations />} />

            <Route path="*" element={<Navigate to="/dashboard/student/overview" replace />} />
          </Routes>
        </Container>
      </main>
    </div>
  );
};

const AdminDashboard = () => (
  <DashboardProvider>
    <InnerAdmin />
  </DashboardProvider>
);

export default AdminDashboard;
