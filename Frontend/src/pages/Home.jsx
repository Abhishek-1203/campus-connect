
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-content">
        <h1>CampusConnect</h1>

        <p className="home-subtitle">
          Your campus, your opportunities, your community.
        </p>

        <h2>Welcome! Choose your portal</h2>

        <div className="portal-options">
          <button
            className="portal-card student-portal"
            onClick={() => navigate("/student/login")}
          >
            <span className="portal-icon">🎓</span>
            <h3>Student</h3>
            <p>
              Discover events, register, and explore campus opportunities.
            </p>
            <span className="portal-action">
              Continue as Student →
            </span>
          </button>

          <button
            className="portal-card admin-portal"
            onClick={() => navigate("/admin/login")}
          >
            <span className="portal-icon">🛡️</span>
            <h3>Admin</h3>
            <p>
              Manage campus events, participants, and student suggestions.
            </p>
            <span className="portal-action">
              Admin Login →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
