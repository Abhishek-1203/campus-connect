
const db = require("../config/db");

// Register the logged-in student for an event
const registerForEvent = (req, res) => {
    const userId = req.user.id;
    const eventId = Number(req.params.eventId);

    if (!Number.isInteger(eventId) || eventId < 1) {
        return res.status(400).json({
            message: "Invalid event ID"
        });
    }

    // Check event and capacity
    const sql = `
        SELECT e.id, e.capacity, e.event_date,
               COUNT(r.id) AS registered_count
        FROM events e
        LEFT JOIN registrations r ON r.event_id = e.id
        WHERE e.id = ?
        GROUP BY e.id, e.capacity, e.event_date
    `;

    db.query(sql, [eventId], (err, events) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to check event"
            });
        }

        if (events.length === 0) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const event = events[0];

        if (!event.event_date || new Date(event.event_date) <= new Date()) {
            return res.status(400).json({
                message: "Registration is closed for this event"
            });
        }

        if (event.registered_count >= event.capacity) {
            return res.status(400).json({
                message: "This event is full"
            });
        }

        // Insert registration; database prevents duplicates
        db.query(
            "INSERT INTO registrations (user_id, event_id) VALUES (?, ?)",
            [userId, eventId],
            (insertErr, result) => {
                if (insertErr) {
                    if (insertErr.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            message: "You are already registered"
                        });
                    }

                    console.error(insertErr);
                    return res.status(500).json({
                        message: "Registration failed"
                    });
                }

                return res.status(201).json({
                    message: "Event registration successful",
                    registrationId: result.insertId
                });
            }
        );
    });
};

// Get registrations belonging to the logged-in student
const getMyRegistrations = (req, res) => {
    const sql = `
        SELECT r.id AS registration_id,
               r.registered_at,
               e.id AS event_id,
               e.title,
               e.description,
               e.event_date,
               e.venue,
               e.capacity
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        WHERE r.user_id = ?
        ORDER BY r.registered_at DESC
    `;

    db.query(sql, [req.user.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch registrations"
            });
        }

        return res.json(results);
    });
};

module.exports = {
    registerForEvent,
    getMyRegistrations
};