import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function AdminReports() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await api.get("/admin/reports");
        setReports(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load reports."
        );
      }
    };

    loadReports();
  }, []);

  if (error) {
    return (
      <main className="dashboard admin-reports">
        <header className="admin-reports-header">
          <h1>Reports & Analytics</h1>
          <p>Overview of CampusConnect activity.</p>
        </header>

        <p className="dashboard-error">{error}</p>
      </main>
    );
  }

  if (!reports) {
    return (
      <main className="dashboard admin-reports">
        <header className="admin-reports-header">
          <h1>Reports & Analytics</h1>
          <p>Overview of CampusConnect activity.</p>
        </header>

        <p className="admin-reports-loading">
          Loading reports...
        </p>
      </main>
    );
  }

  const statistics = [
    {
      label: "Total Events",
      value: reports.total_events,
    },
    {
      label: "Total Registrations",
      value: reports.total_registrations,
    },
    {
      label: "Total Students",
      value: reports.total_students,
    },
    {
      label: "Present",
      value: reports.total_present,
    },
    {
      label: "Absent",
      value: reports.total_absent,
    },
    {
      label: "Pending Suggestions",
      value: reports.pending_suggestions,
    },
  ];

  return (
    <main className="dashboard admin-reports">
      <header className="admin-reports-header">
        <p className="admin-eyebrow">
          CAMPUSCONNECT ADMINISTRATION
        </p>

        <h1>Reports & Analytics</h1>

        <p>
          Overview of CampusConnect activity and participation.
        </p>
      </header>

      <section className="admin-reports-grid">
        {statistics.map((item) => (
          <article
            className="admin-report-card"
            key={item.label}
          >
            <h3>{item.label}</h3>

            <p className="admin-report-value">
              {item.value ?? 0}
            </p>
          </article>
        ))}
      </section>

      <section className="dashboard-section">
        <button
          type="button"
          className="dashboard-button"
          onClick={() => window.location.assign("/admin")}
        >
          Back to Admin Dashboard
        </button>
      </section>
    </main>
  );
}