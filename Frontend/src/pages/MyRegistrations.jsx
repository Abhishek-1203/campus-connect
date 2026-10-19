
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/registrations/my");
      const data = response.data;

      setRegistrations(
        Array.isArray(data)
          ? data
          : data.registrations || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your registrations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-brand">My Registrations</h1>
          <p className="dashboard-welcome">
            View the campus events you've registered for.
          </p>
        </div>

        <Link to="/student" className="dashboard-button">
          Back to Dashboard
        </Link>
      </header>

      <div className="dashboard-content">
        {!loading && !error && (
          <section className="dashboard-section">
            <div className="dashboard-card">
              <h3>Total Registrations</h3>
              <p className="dashboard-number">
                {registrations.length}
              </p>
            </div>
          </section>
        )}

        <section className="dashboard-section">
          {loading ? (
            <p>Loading your registrations...</p>
          ) : error ? (
            <div>
              <p className="dashboard-error">{error}</p>
              <button
                className="dashboard-button"
                onClick={loadRegistrations}
              >
                Try Again
              </button>
            </div>
          ) : registrations.length === 0 ? (
            <div className="dashboard-card">
              <h2>No registrations yet</h2>
              <p>
                You haven't registered for any campus events yet.
                Explore the available events to get started!
              </p>
              <Link to="/student" className="dashboard-button">
                Explore Events
              </Link>
            </div>
          ) : (
            <div className="dashboard-list">
              {registrations.map((registration, index) => (
                <article
                  className="dashboard-item"
                  key={
                    registration.registration_id ??
                    registration.id ??
                    `${registration.event_id}-${index}`
                  }
                >
                  <h3>
                    {registration.title ||
                      registration.event_title ||
                      `Event #${registration.event_id}`}
                  </h3>

                  <p>
                    <strong>Event ID:</strong>{" "}
                    {registration.event_id ?? "Not available"}
                  </p>

                  <p>
                    <strong>Event Date:</strong>{" "}
                    {registration.event_date
                      ? new Date(
                          registration.event_date
                        ).toLocaleString()
                      : "Not available"}
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {registration.location || "Not available"}
                  </p>

                  <p>
                    <strong>Registered On:</strong>{" "}
                    {registration.registered_at
                      ? new Date(
                          registration.registered_at
                        ).toLocaleString()
                      : "Not available"}
                  </p>

                  <span className="dashboard-status reviewed">
                    Registered
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
