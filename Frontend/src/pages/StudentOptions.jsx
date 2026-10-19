
import { Link } from "react-router-dom";
import "../styles/Home.css";

export default function StudentOptions() {
  return (
    <div className="home-page">
      <div className="home-content">
        <h1>Student Portal</h1>

        <p className="home-subtitle">
          Welcome to your CampusConnect student community.
        </p>

        <div className="student-welcome-card">
          <span className="portal-icon">🎓</span>

          <h2>Welcome, Student!</h2>

          <p>
            Discover campus events, explore opportunities, and
            stay connected with your college community.
          </p>

          <div className="student-auth-links">
            <Link to="/student/login">Login</Link>

            <span>New to CampusConnect?</span>

            <Link to="/student/register">Create an Account</Link>
          </div>
        </div>

        <p className="auth-footer">
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
