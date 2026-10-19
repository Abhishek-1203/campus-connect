
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function CreateEvent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    venue: "",
    capacity: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/events", {
        ...form,
        title: form.title.trim(),
        venue: form.venue.trim(),
        capacity: Number(form.capacity),
      });

      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Create Event</h1>
          <p>Add a new campus event to CampusConnect.</p>
        </div>

        <Link to="/admin" className="dashboard-button">
          Back to Dashboard
        </Link>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-card">
          <form onSubmit={handleSubmit} className="event-form">
            <label htmlFor="title">Event Title</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the event"
              rows="4"
            />

            <label htmlFor="event_date">Event Date and Time</label>
            <input
              id="event_date"
              name="event_date"
              type="datetime-local"
              value={form.event_date}
              onChange={handleChange}
              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)}
              required
            />

            <label htmlFor="venue">Venue / Location</label>
            <input
              id="venue"
              name="venue"
              value={form.venue}
              onChange={handleChange}
              placeholder="Enter venue or location"
              required
            />

            <label htmlFor="capacity">Capacity</label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              step="1"
              value={form.capacity}
              onChange={handleChange}
              placeholder="Maximum number of participants"
              required
            />

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
