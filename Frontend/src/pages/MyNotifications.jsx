
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function MyNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/notifications/my");
      const data = response.data;

      setNotifications(
        Array.isArray(data) ? data : data.notifications || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-brand">My Notifications</h1>
          <p className="dashboard-welcome">
            Stay updated with campus activities.
          </p>
        </div>
      </header>

      <div className="dashboard-content">
        {loading ? (
          <p>Loading notifications...</p>
        ) : error ? (
          <div className="dashboard-card">
            <p className="dashboard-error">{error}</p>
            <button
              type="button"
              className="dashboard-button"
              onClick={loadNotifications}
            >
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="dashboard-card">
            <h2>You're all caught up!</h2>
            <p>You don't have any notifications right now.</p>
          </div>
        ) : (
          <div className="dashboard-list">
            {notifications.map((notification, index) => (
              <article
                className="dashboard-item"
                key={notification.id ?? index}
              >
                <h3>
                  {notification.title ||
                    notification.message ||
                    "Campus notification"}
                </h3>

                {notification.title && notification.message && (
                  <p>{notification.message}</p>
                )}

                {notification.created_at && (
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
