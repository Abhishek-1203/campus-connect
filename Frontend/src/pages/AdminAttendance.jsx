import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function AdminAttendance() {
  const { eventId } = useParams();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState(null);

  const loadAttendance = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/attendance/event/${eventId}`
      );

      setStudents(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [eventId]);

  const updateAttendance = async (registrationId, status) => {
    setSavingId(registrationId);
    setError("");
    setMessage("");

    try {
      await api.patch(
        `/attendance/${registrationId}`,
        { status }
      );

      setMessage("Attendance updated successfully.");
      await loadAttendance();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update attendance."
      );
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <main className="dashboard">Loading attendance...</main>;
  }

  return (
    <main className="dashboard">
      <h1>Event Attendance</h1>
      <p>Event ID: {eventId}</p>

      {error && <p className="dashboard-error">{error}</p>}
      {message && <p className="dashboard-success">{message}</p>}

      {students.length === 0 ? (
        <p>No students have registered for this event yet.</p>
      ) : (
        <div className="dashboard-list">
          {students.map((student) => (
            <article
              className="dashboard-item"
              key={student.registration_id}
            >
              <h3>{student.student_name}</h3>
              <p>{student.student_email}</p>

              <p>
                Attendance:{" "}
                {student.attendance_status || "Not marked"}
              </p>

              <div className="admin-card-actions">
                <button
                  type="button"
                  className="dashboard-button"
                  disabled={savingId === student.registration_id}
                  onClick={() =>
                    updateAttendance(
                      student.registration_id,
                      "present"
                    )
                  }
                >
                  Mark Present
                </button>

                <button
                  type="button"
                  className="dashboard-button admin-delete-button"
                  disabled={savingId === student.registration_id}
                  onClick={() =>
                    updateAttendance(
                      student.registration_id,
                      "absent"
                    )
                  }
                >
                  Mark Absent
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}