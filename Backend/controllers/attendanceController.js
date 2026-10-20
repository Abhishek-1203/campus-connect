const db = require("../config/db");

// Get registered students and their attendance for an event
const getEventAttendance = (req, res) => {
    const eventId = Number(req.params.eventId);

    if (!Number.isInteger(eventId) || eventId < 1) {
        return res.status(400).json({
            message: "Invalid event ID"
        });
    }

    const sql = `
        SELECT
            r.id AS registration_id,
            u.id AS student_id,
            u.name AS student_name,
            u.email AS student_email,
            a.status AS attendance_status,
            a.marked_at
        FROM registrations r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN attendance a ON a.registration_id = r.id
        WHERE r.event_id = ?
        ORDER BY u.name ASC
    `;

    db.query(sql, [eventId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch attendance"
            });
        }

        return res.json(results);
    });
};

// Mark a registered student present or absent
const markAttendance = (req, res) => {
    const registrationId = Number(req.params.registrationId);
    const { status } = req.body;

    if (!Number.isInteger(registrationId) || registrationId < 1) {
        return res.status(400).json({
            message: "Invalid registration ID"
        });
    }

    if (!["present", "absent"].includes(status)) {
        return res.status(400).json({
            message: "Status must be present or absent"
        });
    }

    const sql = `
        INSERT INTO attendance (registration_id, status, marked_by)
        SELECT id, ?, ?
        FROM registrations
        WHERE id = ?
        ON DUPLICATE KEY UPDATE
            status = VALUES(status),
            marked_by = VALUES(marked_by),
            marked_at = CURRENT_TIMESTAMP
    `;

    db.query(
        sql,
        [status, req.user.id, registrationId],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Failed to mark attendance"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Registration not found"
                });
            }

            return res.json({
                message: "Attendance updated successfully"
            });
        }
    );
};

module.exports = {
    getEventAttendance,
    markAttendance
};