
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentLayout from "./components/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard";
import MyRegistrations from "./pages/MyRegistrations";
import MyCertificates from "./pages/MyCertificates";
import MyNotifications from "./pages/MyNotifications";
import MyProfile from "./pages/MyProfile";

import AdminDashboard from "./pages/AdminDashboard";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import EventParticipants from "./pages/EventParticipants";

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={role === "admin" ? "/admin/login" : "/student/login"}
        replace
      />
    );
  }

  if (user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function StudentPortal() {
  return (
    <ProtectedRoute role="student">
      <StudentLayout />
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Student authentication */}
      <Route
        path="/student/login"
        element={<Login expectedRole="student" />}
      />
      <Route path="/student/register" element={<Register />} />

      {/* Admin authentication */}
      <Route
        path="/admin/login"
        element={<Login expectedRole="admin" />}
      />

      {/* Student Portal */}
      <Route path="/student" element={<StudentPortal />}>
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

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

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

      {/* Legacy URLs */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route
        path="/register"
        element={<Navigate to="/student/register" replace />}
      />

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
