
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function AdminCertificateTemplate() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [file, setFile] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getServerUrl = () => {
    const baseURL = api.defaults.baseURL || "http://localhost:5000/api";
    return baseURL.replace(/\/api\/?$/, "");
  };

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      setLoading(true);
      setError("");

      try {
        const [eventsResponse, templateResponse] = await Promise.all([
          api.get("/events"),
          api.get(`/certificate-templates/${eventId}`),
        ]);

        const eventsData = Array.isArray(eventsResponse.data)
          ? eventsResponse.data
          : eventsResponse.data.events || [];

        const selectedEvent = eventsData.find(
          (item) => String(item.id) === String(eventId)
        );

        if (!selectedEvent) {
          throw new Error("Event not found.");
        }

        if (active) {
          setEvent(selectedEvent);
          setTemplate(templateResponse.data.template || null);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Could not load event certificate details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [eventId]);

  const handleUpload = async (e) => {
    e.preventDefault();

    // Use the selected file stored in React state
    if (!file) {
      setError("Please choose a file using the Choose File button.");
      return;
    }

    const formData = new FormData();
    formData.append("template", file);

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post(
        `/certificate-templates/${eventId}/upload`,
        formData
      );

      setTemplate({
        event_id: Number(eventId),
        template_filename: response.data.filename,
        template_url: response.data.template_url,
        uploaded_at: new Date().toISOString(),
      });

      setMessage(
        response.data.message || "Certificate template uploaded successfully."
      );

      setFile(null);

      const input = document.getElementById("certificate-template");
      if (input) input.value = "";
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Upload failed. Check the backend terminal for details."
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <main className="dashboard">
        <p>Loading event certificate details...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="dashboard">
        <h1>Certificate Template</h1>
        <p className="dashboard-error">
          {error || "Event not found."}
        </p>
        <Link to="/admin" className="dashboard-button">
          Back to Admin Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="admin-eyebrow">EVENT CERTIFICATE MANAGEMENT</p>
          <h1 className="dashboard-brand">Upload Certificate Template</h1>
          <p className="dashboard-welcome">
            Event: <strong>{event.title}</strong>
          </p>
        </div>

        <Link to="/admin" className="dashboard-button">
          Back to Admin Dashboard
        </Link>
      </header>

      <div className="dashboard-content">
        <section className="dashboard-section">
          <div className="dashboard-card">
            <h2>{event.title}</h2>

            <p>
              Upload a PDF, PNG, or JPG template for this event.
              Maximum file size: 5 MB.
            </p>

            {template && (
              <div style={{ margin: "20px 0" }}>
                <p>
                  <strong>Current template:</strong>{" "}
                  {template.template_filename}
                </p>

                <a
                  className="dashboard-button"
                  href={`${getServerUrl()}${template.template_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Current Template
                </a>
              </div>
            )}

            <form onSubmit={handleUpload}>
              <div style={{ margin: "20px 0" }}>
                <label
                  htmlFor="certificate-template"
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    fontWeight: 600,
                  }}
                >
                  {template ? "Choose replacement template" : "Choose template"}
                </label>

                <input
                  id="certificate-template"
                  name="template"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                  required
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    setFile(selectedFile);
                    setError("");
                    setMessage("");
                  }}
                />
              </div>

              {file && (
                <p>
                  Selected file: <strong>{file.name}</strong>
                  {" "}({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}

              {error && (
                <p className="dashboard-error" role="alert">
                  {error}
                </p>
              )}

              {message && (
                <p className="dashboard-success" role="status">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="dashboard-button"
                disabled={uploading || !file}
              >
                {uploading
                  ? "Uploading..."
                  : template
                    ? "Replace Event Template"
                    : "Upload Event Template"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
