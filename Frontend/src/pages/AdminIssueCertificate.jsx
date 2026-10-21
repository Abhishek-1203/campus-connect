
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function AdminIssueCertificate() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");

  const serverUrl = (
    api.defaults.baseURL || "http://localhost:5000/api"
  ).replace(/\/api\/?$/, "");

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      setLoading(true);
      setError("");

      try {
        const [eventsResponse, studentsResponse, templateResponse] =
          await Promise.all([
            api.get("/events"),
            api.get(`/attendance/event/${eventId}`),
            api.get(`/certificate-templates/${eventId}`),
          ]);

        const eventData = Array.isArray(eventsResponse.data)
          ? eventsResponse.data
          : eventsResponse.data.events || [];

        const selectedEvent = eventData.find(
          (item) => String(item.id) === String(eventId)
        );

        if (!selectedEvent) {
          throw new Error("Event not found.");
        }

        if (!templateResponse.data.template) {
          throw new Error(
            "Upload a certificate template for this event before issuing certificates."
          );
        }

        if (active) {
          setEvent(selectedEvent);
          setStudents(
            Array.isArray(studentsResponse.data)
              ? studentsResponse.data
              : []
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Could not load event participants."
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

  const handleIssue = async (e) => {
    e.preventDefault();

    if (!studentId) {
      setError("Please select a student.");
      return;
    }

    setIssuing(true);
    setError("");
    setMessage("");
    setCertificateUrl("");

    try {
      const response = await api.post("/certificates/issue", {
        user_id: Number(studentId),
        event_id: Number(eventId),
      });

      setMessage(
        response.data.message || "Certificate issued successfully."
      );

      if (response.data.certificate_url) {
        setCertificateUrl(response.data.certificate_url);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not issue the certificate."
      );
    } finally {
      setIssuing(false);
    }
  };

  if (loading) {
    return (
      <main className="dashboard">
        <p>Loading registered students...</p>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="admin-eyebrow">CERTIFICATE MANAGEMENT</p>
          <h1 className="dashboard-brand">Issue Certificates</h1>
          <p className="dashboard-welcome">
            Event: <strong>{event?.title || `Event ${eventId}`}</strong>
          </p>
        </div>

        <Link to="/admin" className="dashboard-button">
          Back to Admin Dashboard
        </Link>
      </header>

      <div className="dashboard-content">
        <section className="dashboard-section">
          <div className="dashboard-card">
            <h2>Select a Registered Student</h2>

            <p>
              Only students registered for this event are listed.
              The certificate will use this event's uploaded template.
            </p>

            {students.length === 0 ? (
              <p>No registered students were found for this event.</p>
            ) : (
              <form onSubmit={handleIssue}>
                <label
                  htmlFor="certificate-student"
                  style={{
                    display: "block",
                    margin: "20px 0 8px",
                    fontWeight: 600,
                  }}
                >
                  Student
                </label>

                <select
                  id="certificate-student"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d7e3df",
                    borderRadius: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <option value="">Choose a student</option>

                  {students.map((student) => (
                    <option
                      key={student.student_id}
                      value={student.student_id}
                    >
                      {student.student_name} ({student.student_email})
                    </option>
                  ))}
                </select>

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

                {certificateUrl && (
                  <p>
                    <a
                      className="dashboard-button"
                      href={`${serverUrl}${certificateUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Generated Certificate
                    </a>
                  </p>
                )}

                <button
                  type="submit"
                  className="dashboard-button"
                  disabled={issuing}
                >
                  {issuing ? "Generating..." : "Generate & Issue Certificate"}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
