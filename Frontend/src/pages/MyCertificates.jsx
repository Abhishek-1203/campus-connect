import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/certificates/my");
      const data = response.data;

      setCertificates(
        Array.isArray(data)
          ? data
          : data.certificates || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your certificates. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString();
  };

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-brand">My Certificates</h1>
          <p className="dashboard-welcome">
            View certificates you've earned from campus events.
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
              <h3>Total Certificates</h3>
              <p className="dashboard-number">
                {certificates.length}
              </p>
            </div>
          </section>
        )}

        <section className="dashboard-section">
          {loading ? (
            <p>Loading your certificates...</p>
          ) : error ? (
            <div className="dashboard-card">
              <p className="dashboard-error">{error}</p>

              <button
                type="button"
                className="dashboard-button"
                onClick={loadCertificates}
              >
                Try Again
              </button>
            </div>
          ) : certificates.length === 0 ? (
            <div className="dashboard-card">
              <h2>No certificates yet</h2>
              <p>
                Your certificates will appear here when they are
                issued for completed campus events.
              </p>
            </div>
          ) : (
            <div className="dashboard-grid">
              {certificates.map((certificate, index) => (
                <article
                  className="dashboard-card"
                  key={
                    certificate.certificate_id ??
                    certificate.id ??
                    index
                  }
                >
                  <h3>
                    {certificate.event_title ||
                      certificate.title ||
                      `Certificate #${
                        certificate.certificate_id ??
                        certificate.id ??
                        index + 1
                      }`}
                  </h3>

                  <p>
                    <strong>Certificate ID:</strong>{" "}
                    {certificate.certificate_id ??
                      certificate.id ??
                      "Not available"}
                  </p>

                  <p>
                    <strong>Issued On:</strong>{" "}
                    {formatDate(certificate.issued_at)}
                  </p>

                  {certificate.certificate_url ? (
                    <a
                      className="dashboard-button"
                      href={certificate.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Certificate
                    </a>
                  ) : (
                    <p>
                      Certificate file is not available yet.
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}