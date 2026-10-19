
const db = require("../config/db");

// Get admin dashboard statistics
const getDashboardStats = (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM events) AS total_events,
            (SELECT COUNT(*) FROM registrations) AS total_registrations,
            (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
            (SELECT COUNT(*) FROM suggestions WHERE status = 'pending') AS pending_suggestions
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Failed to fetch dashboard statistics"
            });
        }

        return res.json(results[0]);
    });
};

// Get participants registered for an event
const getEventParticipants = (req, res) => {
    const eventId = Number(req.params.eventId);

    if (!Number.isInteger(eventId) || eventId < 1) {
        return res.status(400).json({
            message: "Invalid event ID"
        });
    }

    const sql = `
        SELECT
            r.id AS registration_id,
            r.registered_at,
            u.id AS student_id,
            u.name,
            u.email
        FROM registrations r
        JOIN users u ON r.user_id = u.id
        WHERE r.event_id = ?
        ORDER BY r.registered_at DESC
    `;

    db.query(sql, [eventId], (err, results) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Failed to fetch event participants"
            });
        }

        return res.json(results);
    });
};

module.exports = {
    getDashboardStats,
    getEventParticipants
};
