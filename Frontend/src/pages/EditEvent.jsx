
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    capacity: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        const event = response.data.event || response.data;

        setForm({
          title: event.title || "",
          description: event.description || "",
          event_date: event.event_date
            ? new Date(
                new Date(event.event_date).getTime() -
                  new Date(event.event_date).getTimezoneOffset() * 60000
              )
                .toISOString()
                .slice(0, 16)
            : "",
          location: event.location || "",
          capacity: event.capacity ?? "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load this event."
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.put(`/events/${id}`, {
        ...form,
        capacity: Number(form.capacity),
      });

      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not update this event."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="dashboard-page">Loading event...</div>;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Edit Event</h1>
          <p>Update the details of your campus event.</p>
        </div>
        <Link to="/admin" className="dashboard-button">
          Back to Dashboard
        </Link>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-card">
          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit} className="event-form">
            <label htmlFor="title">Event Title</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
            />

            <label htmlFor="event_date">Event Date and Time</label>
            <input
              id="event_date"
              name="event_date"
              type="datetime-local"
              value={form.event_date}
              onChange={handleChange}
              required
            />

            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            />

            <label htmlFor="capacity">Capacity</label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              value={form.capacity}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
