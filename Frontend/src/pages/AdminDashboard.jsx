
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_events: 0,
    total_registrations: 0,
    total_students: 0,
    pending_suggestions: 0,
  });

  const [events, setEvents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [eventSearch, setEventSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsResponse, eventsResponse, suggestionsResponse] =
        await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/events"),
          api.get("/suggestions"),
        ]);

      const statsData = statsResponse.data;
      const eventsData = eventsResponse.data;
      const suggestionsData = suggestionsResponse.data;

      setStats(statsData.stats || statsData.dashboard || statsData);

      setEvents(
        Array.isArray(eventsData)
          ? eventsData
          : eventsData.events || []
      );

      setSuggestions(
        Array.isArray(suggestionsData)
          ? suggestionsData
          : suggestionsData.suggestions || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load the admin dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const filteredEvents = events.filter((event) => {
    const search = eventSearch.toLowerCase().trim();

    return (
      (event.title || "").toLowerCase().includes(search) ||
      (event.location || event.venue || "")
        .toLowerCase()
        .includes(search)
    );
  });

  const handleSuggestionStatus = async (id, status) => {
    setUpdatingId(id);
    setError("");
    setMessage("");

    try {
      await api.patch(`/suggestions/${id}/status`, { status });

      setSuggestions((current) =>
        current.map((suggestion) =>
          suggestion.id === id
            ? { ...suggestion, status }
            : suggestion
        )
      );

      setMessage("Suggestion status updated successfully.");
      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update the suggestion status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    setDeletingId(eventId);
    setError("");
    setMessage("");

    try {
      await api.delete(`/events/${eventId}`);

      setEvents((current) =>
        current.filter((event) => event.id !== eventId)
      );

      setMessage("Event deleted successfully.");
      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete the event."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <main className="dashboard">
        <p>Loading admin dashboard...</p>
      </main>
    );
  }

  return (
    <main className="dashboard admin-dashboard">
      <header className="dashboard-header">
        <div>
          <p className="admin-eyebrow">
            CAMPUSCONNECT ADMINISTRATION
          </p>

          <h1 className="dashboard-brand">Admin Dashboard</h1>

          <p className="dashboard-welcome">
            Manage campus events, registrations, and student suggestions.
          </p>
        </div>

        <div className="admin-card-actions">
          <button
            type="button"
            className="dashboard-button"
            onClick={() => navigate("/admin/reports")}
          >
            Reports & Analytics
          </button>

          <button
            type="button"
            className="dashboard-button"
            onClick={() => navigate("/admin/events/new")}
          >
            + Create Event
          </button>
        </div>
      </header>

      {error && <p className="dashboard-error">{error}</p>}
      {message && <p className="dashboard-success">{message}</p>}

      <section className="dashboard-section">
        <h2>Platform Overview</h2>

        <div className="dashboard-grid admin-stats-grid">
          <article className="dashboard-card admin-stat-card">
            <span className="admin-stat-icon">▦</span>
            <p>Total Events</p>
            <h3 className="dashboard-number">
              {stats.total_events ?? 0}
            </h3>
          </article>

          <article className="dashboard-card admin-stat-card">
            <span className="admin-stat-icon">♙</span>
            <p>Total Students</p>
            <h3 className="dashboard-number">
              {stats.total_students ?? 0}
            </h3>
          </article>

          <article className="dashboard-card admin-stat-card">
            <span className="admin-stat-icon">✓</span>
            <p>Registrations</p>
            <h3 className="dashboard-number">
              {stats.total_registrations ?? 0}
            </h3>
          </article>

          <article className="dashboard-card admin-stat-card">
            <span className="admin-stat-icon">✉</span>
            <p>Pending Suggestions</p>
            <h3 className="dashboard-number">
              {stats.pending_suggestions ?? 0}
            </h3>
          </article>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="admin-section-heading">
          <div>
            <h2>Event Management</h2>
            <p>Manage events and their individual certificate templates.</p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                margin: "20px 0",
              }}
            >
              <input
                type="text"
                placeholder="Search events by title or location..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "1px solid #d7e3df",
                  borderRadius: "10px",
                }}
              />
            </div>
          </div>

          <button
            type="button"
            className="dashboard-button"
            onClick={() => navigate("/admin/events/new")}
          >
            Create Event
          </button>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="dashboard-card">
            <h3>No events found</h3>
            <p>Create an event or adjust your search.</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            {filteredEvents.map((event) => (
              <article className="dashboard-card" key={event.id}>
                <h3>{event.title}</h3>

                <p>{event.description || "No description available."}</p>

                <p>
                  <strong>Date:</strong>{" "}
                  {event.event_date
                    ? new Date(event.event_date).toLocaleString()
                    : "Not specified"}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {event.location || event.venue || "Not specified"}
                </p>

                <p>
                  <strong>Capacity:</strong>{" "}
                  {event.capacity ?? "Not specified"}
                </p>

                <div className="admin-card-actions">
                  <button
                    type="button"
                    className="dashboard-button"
                    onClick={() =>
                      navigate(`/admin/events/${event.id}/participants`)
                    }
                  >
                    Participants
                  </button>

                  <button
                    type="button"
                    className="dashboard-button"
                    onClick={() =>
                      navigate(`/admin/events/${event.id}/attendance`)
                    }
                  >
                    Mark Attendance
                  </button>

                  <button
                    type="button"
                    className="dashboard-button"
                    onClick={() =>
                      navigate(
                        `/admin/events/${event.id}/certificate-template`
                      )
                    }
                  >
                    Upload Certificate
                  </button>

                  {/* New: issue a certificate for this event */}
                  <button
                    type="button"
                    className="dashboard-button"
                    onClick={() =>
                      navigate(
                        `/admin/events/${event.id}/issue-certificates`
                      )
                    }
                  >
                    Issue Certificate
                  </button>

                  <button
                    type="button"
                    className="dashboard-button"
                    onClick={() =>
                      navigate(`/admin/events/${event.id}/edit`)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="dashboard-button admin-delete-button"
                    disabled={deletingId === event.id}
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    {deletingId === event.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="admin-section-heading">
          <div>
            <h2>Student Suggestions</h2>
            <p>Review feedback submitted by students.</p>
          </div>
        </div>

        {suggestions.length === 0 ? (
          <div className="dashboard-card">
            <p>No student suggestions have been submitted yet.</p>
          </div>
        ) : (
          <div className="dashboard-list">
            {suggestions.map((suggestion) => (
              <article className="dashboard-item" key={suggestion.id}>
                <h3>Suggestion #{suggestion.id}</h3>
                <p>{suggestion.message}</p>

                <p>
                  <strong>Status:</strong>{" "}
                  {suggestion.status || "pending"}
                </p>

                <div className="admin-card-actions">
                  <button
                    type="button"
                    className="dashboard-button"
                    disabled={updatingId === suggestion.id}
                    onClick={() =>
                      handleSuggestionStatus(suggestion.id, "reviewed")
                    }
                  >
                    Mark Reviewed
                  </button>

                  <button
                    type="button"
                    className="dashboard-button"
                    disabled={updatingId === suggestion.id}
                    onClick={() =>
                      handleSuggestionStatus(suggestion.id, "resolved")
                    }
                  >
                    Mark Resolved
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
