
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registeringId, setRegisteringId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [eventsResponse, registrationsResponse] =
          await Promise.all([
            api.get("/events"),
            api.get("/registrations/my"),
          ]);

        const eventsData = eventsResponse.data;
        const registrationsData = registrationsResponse.data;

        setEvents(
          Array.isArray(eventsData)
            ? eventsData
            : eventsData.events || []
        );

        setRegistrations(
          Array.isArray(registrationsData)
            ? registrationsData
            : registrationsData.registrations || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load the dashboard. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleRegister = async (eventId) => {
    setRegisteringId(eventId);
    setMessage("");
    setError("");

    try {
      await api.post(`/registrations/${eventId}`);

      setMessage("Successfully registered for the event!");

      const response = await api.get("/registrations/my");
      const data = response.data;

      setRegistrations(
        Array.isArray(data) ? data : data.registrations || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not register for this event."
      );
    } finally {
      setRegisteringId(null);
    }
  };

  const getEventId = (registration) =>
    registration.event_id ?? registration.id;

  const isRegistered = (eventId) =>
    registrations.some(
      (registration) => Number(getEventId(registration)) === Number(eventId)
    );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-brand">Student Dashboard</h1>
          <p className="dashboard-welcome">
            Discover campus events and manage your activities.
          </p>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="dashboard-section">
          <h2>Overview</h2>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Available Events</h3>
              <p className="dashboard-number">{events.length}</p>
            </div>

            <div className="dashboard-card">
              <h3>My Registrations</h3>
              <p className="dashboard-number">
                {registrations.length}
              </p>
              <button
                type="button"
                className="dashboard-button"
                onClick={() => navigate("/student/registrations")}
              >
                View Registrations
              </button>
            </div>

            <div className="dashboard-card">
              <h3>My Certificates</h3>
              <p>View your earned certificates.</p>
              <button
                type="button"
                className="dashboard-button"
                onClick={() => navigate("/student/certificates")}
              >
                View Certificates
              </button>
            </div>
          </div>
        </section>

        {message && <p className="dashboard-success">{message}</p>}
        {error && <p className="dashboard-error">{error}</p>}

        <section className="dashboard-section">
          <h2>Available Campus Events</h2>

          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <div className="dashboard-card">
              <p>No campus events are available right now.</p>
            </div>
          ) : (
            <div className="dashboard-grid">
              {events.map((event) => {
                const registered = isRegistered(event.id);

                return (
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
                      {event.location || "Not specified"}
                    </p>

                    <p>
                      <strong>Capacity:</strong>{" "}
                      {event.capacity ?? "Not specified"}
                    </p>

                    {registered ? (
                      <button
                        type="button"
                        className="dashboard-button"
                        disabled
                      >
                        Already Registered
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="dashboard-button"
                        disabled={registeringId === event.id}
                        onClick={() => handleRegister(event.id)}
                      >
                        {registeringId === event.id
                          ? "Registering..."
                          : "Register"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
