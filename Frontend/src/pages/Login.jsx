
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

export default function Login({ expectedRole = "student" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const isAdmin = expectedRole === "admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      const savedUser =
        loggedInUser ||
        JSON.parse(localStorage.getItem("user") || "null");

      if (savedUser?.role !== expectedRole) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.reload();
        return;
      }

      navigate(isAdmin ? "/admin" : "/student", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>CampusConnect</h1>

        <p className="auth-subtitle">
          {isAdmin ? "Admin Portal Login" : "Student Portal Login"}
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? "Logging in..."
              : isAdmin
                ? "Login as Admin"
                : "Login as Student"}
          </button>
        </form>

        {!isAdmin && (
          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/student/register">Register</Link>
          </p>
        )}
      </div>
    </div>
  );
}
