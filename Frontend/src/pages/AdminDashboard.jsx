
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      api.get("/admin/dashboard"),
      api.get("/events"),
      api.get("/suggestions"),
    ]);

    if (results[0].status === "fulfilled") {
      setStats(results[0].value.data);
    }

    if (results[1].status === "fulfilled") {
      setEvents(results[1].value.data);
    }

    if (results[2].status === "fulfilled") {
      setSuggestions(results[2].value.data);
    }

    if (results.some((result) => result.status === "rejected")) {
      setError("Some dashboard data could not be loaded. Please refresh.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const updateSuggestion = async (id, status) => {
    try {
      await api.patch(`/suggestions/${id}/status`, { status });
      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update suggestion."
      );
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/events/${eventId}`);
      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not delete this event."
      );
    }
  };

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-brand">CampusConnect Admin</h1>
          <p className="dashboard-welcome">
            Welcome, {user?.name || "Admin"}! Manage your campus activities.
          </p>
        </div>

        <button className="dashboard-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        {error && <p className="dashboard-error">{error}</p>}

        <section className="dashboard-section">
          <h2>Dashboard Overview</h2>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Total Events</h3>
              <p className="dashboard-number">
                {stats?.total_events ?? "—"}
              </p>
            </div>

            <div className="dashboard-card">
              <h3>Registrations</h3>
              <p className="dashboard-number">
                {stats?.total_registrations ?? "—"}
              </p>
            </div>

            <div className="dashboard-card">
              <h3>Students</h3>
              <p className="dashboard-number">
                {stats?.total_students ?? "—"}
              </p>
            </div>

            <div className="dashboard-card">
              <h3>Pending Suggestions</h3>
              <p className="dashboard-number">
                {stats?.pending_suggestions ?? "—"}
              </p>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Event Management</h2>

          <button
            className="dashboard-button"
            onClick={() => navigate("/admin/events/new")}
          >
            + Create Event
          </button>

          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <p className="dashboard-empty">No events available.</p>
          ) : (
            <div className="dashboard-list">
              {events.map((event) => (
                <article className="dashboard-item" key={event.id}>
                  <h3>{event.title}</h3>
                  <p>{event.description || "No description provided."}</p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {event.location || "Not specified"}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {event.event_date
                      ? new Date(event.event_date).toLocaleString()
                      : "Not specified"}
                  </p>

                  <p>
                    <strong>Capacity:</strong> {event.capacity}
                  </p>

                  <button
                    className="dashboard-button"
                    onClick={() =>
                      navigate(`/admin/events/${event.id}/participants`)
                    }
                  >
                    View Participants
                  </button>

                  <button
                    className="dashboard-button dashboard-button-secondary"
                    onClick={() =>
                      navigate(`/admin/events/${event.id}/edit`)
                    }
                  >
                    Edit Event
                  </button>

                  <button
                    className="dashboard-button delete-event-button"
                    onClick={() =>
                      handleDeleteEvent(event.id, event.title)
                    }
                  >
                    Delete Event
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Student Suggestions</h2>

          {loading ? (
            <p>Loading suggestions...</p>
          ) : suggestions.length === 0 ? (
            <p className="dashboard-empty">No suggestions found.</p>
          ) : (
            <div className="dashboard-list">
              {suggestions.map((suggestion) => (
                <article className="dashboard-item" key={suggestion.id}>
                  <p>{suggestion.message}</p>

                  <p>
                    <strong>From:</strong> {suggestion.student_name} (
                    {suggestion.student_email})
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`dashboard-status ${suggestion.status}`}
                    >
                      {suggestion.status}
                    </span>
                  </p>

                  <button
                    className="dashboard-button"
                    disabled={suggestion.status === "reviewed"}
                    onClick={() =>
                      updateSuggestion(suggestion.id, "reviewed")
                    }
                  >
                    Mark Reviewed
                  </button>

                  <button
                    className="dashboard-button dashboard-button-secondary"
                    disabled={suggestion.status === "resolved"}
                    onClick={() =>
                      updateSuggestion(suggestion.id, "resolved")
                    }
                  >
                    Mark Resolved
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
