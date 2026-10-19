
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function EventParticipants() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadParticipants = async () => {
      setLoading(true);
      setError("");

      try {
        const [eventResponse, participantsResponse] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/admin/events/${id}/participants`),
        ]);

        setEvent(eventResponse.data.event || eventResponse.data);

        const data = participantsResponse.data;
        setParticipants(
          Array.isArray(data)
            ? data
            : data.participants || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load event participants. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadParticipants();
  }, [id]);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-brand">Event Participants</h1>
          <p className="dashboard-welcome">
            {event?.title || `Event #${id}`}
          </p>
        </div>

        <Link to="/admin" className="dashboard-button">
          Back to Dashboard
        </Link>
      </header>

      <div className="dashboard-content">
        {error && <p className="dashboard-error">{error}</p>}

        {loading ? (
          <p>Loading participants...</p>
        ) : (
          <>
            <section className="dashboard-section">
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h3>Total Registrations</h3>
                  <p className="dashboard-number">
                    {participants.length}
                  </p>
                </div>

                <div className="dashboard-card">
                  <h3>Event Capacity</h3>
                  <p className="dashboard-number">
                    {event?.capacity ?? "—"}
                  </p>
                </div>
              </div>
            </section>

            <section className="dashboard-section">
              <h2>Registered Students</h2>

              {participants.length === 0 ? (
                <p className="dashboard-empty">
                  No students have registered for this event yet.
                </p>
              ) : (
                <div className="dashboard-list">
                  {participants.map((participant, index) => (
                    <article
                      className="dashboard-item"
                      key={
                        participant.registration_id ??
                        participant.id ??
                        index
                      }
                    >
                      <h3>
                        {participant.student_name ||
                          participant.name ||
                          "Student"}
                      </h3>

                      <p>
                        <strong>Email:</strong>{" "}
                        {participant.student_email ||
                          participant.email ||
                          "Not available"}
                      </p>

                      <p>
                        <strong>Student ID:</strong>{" "}
                        {participant.student_id ?? "Not available"}
                      </p>

                      <p>
                        <strong>Registered on:</strong>{" "}
                        {participant.registered_at
                          ? new Date(
                              participant.registered_at
                            ).toLocaleString()
                          : "Not available"}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
