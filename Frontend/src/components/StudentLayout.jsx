
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/StudentLayout.css";

export default function StudentLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isNotificationsPage = location.pathname === "/student/notifications";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="student-layout">
      <aside className="student-sidebar">
        <div className="student-sidebar-brand">
          <h2>CampusConnect</h2>
          <p>Student Portal</p>
        </div>

        <nav className="student-nav">
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              `student-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="student-nav-icon">▦</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/student/registrations"
            className={({ isActive }) =>
              `student-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="student-nav-icon">▣</span>
            <span>My Registrations</span>
          </NavLink>

          <NavLink
            to="/student/certificates"
            className={({ isActive }) =>
              `student-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="student-nav-icon">🏅</span>
            <span>My Certificates</span>
          </NavLink>
        </nav>

        <div className="student-sidebar-bottom">
          <NavLink
            to="/student/profile"
            className={({ isActive }) =>
              `student-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="student-nav-icon">👤</span>
            <span>My Profile</span>
          </NavLink>

          <button
            type="button"
            className="student-logout-button"
            onClick={handleLogout}
          >
            <span className="student-nav-icon">↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="student-main">
        <header className="student-topbar">
          <div className="student-topbar-title">
            {isNotificationsPage ? "Notifications" : "CampusConnect"}
          </div>

          <button
            type="button"
            className={`student-notification-button ${
              isNotificationsPage ? "active" : ""
            }`}
            onClick={() => navigate("/student/notifications")}
            aria-label="Open notifications"
            title="Notifications"
          >
            <svg
              viewBox="0 0 24 24"
              width="23"
              height="23"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
          </button>
        </header>

        <div className="student-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
