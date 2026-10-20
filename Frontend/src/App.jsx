import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import EventParticipants from "./pages/EventParticipants";
import AdminAttendance from "./pages/AdminAttendance";
import AdminReports from "./pages/AdminReports";

import MyRegistrations from "./pages/MyRegistrations";
import MyCertificates from "./pages/MyCertificates";
import MyNotifications from "./pages/MyNotifications";
import MyProfile from "./pages/MyProfile";
import StudentLayout from "./components/StudentLayout";

// Protect routes by authentication and role
function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Authentication */}
          <Route
            path="/student/login"
            element={<Login expectedRole="student" />}
          />

          <Route
            path="/student/register"
            element={<Register />}
          />

          <Route
            path="/admin/login"
            element={<Login expectedRole="admin" />}
          />

          {/* Student Portal */}
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route
              path="registrations"
              element={<MyRegistrations />}
            />
            <Route
              path="certificates"
              element={<MyCertificates />}
            />
            <Route
              path="notifications"
              element={<MyNotifications />}
            />
            <Route
              path="profile"
              element={<MyProfile />}
            />
          </Route>

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Reports & Analytics */}
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute role="admin">
                <AdminReports />
              </ProtectedRoute>
            }
          />

          {/* Admin Event Management */}
          <Route
            path="/admin/events/new"
            element={
              <ProtectedRoute role="admin">
                <CreateEvent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/events/:id/edit"
            element={
              <ProtectedRoute role="admin">
                <EditEvent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/events/:id/participants"
            element={
              <ProtectedRoute role="admin">
                <EventParticipants />
              </ProtectedRoute>
            }
          />

          {/* Admin Attendance */}
          <Route
            path="/admin/events/:eventId/attendance"
            element={
              <ProtectedRoute role="admin">
                <AdminAttendance />
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route
            path="/login"
            element={<Navigate to="/" replace />}
          />

          <Route
            path="/register"
            element={<Navigate to="/student/register" replace />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}