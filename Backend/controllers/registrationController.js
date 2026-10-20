const db = require("../config/db");

// Register the logged-in student for an event safely
const registerForEvent = (req, res) => {
    const userId = req.user.id;
    const eventId = Number(req.params.eventId);

    if (!Number.isInteger(eventId) || eventId < 1) {
        return res.status(400).json({
            message: "Invalid event ID"
        });
    }

    db.beginTransaction((transactionErr) => {
        if (transactionErr) {
            console.error(transactionErr);
            return res.status(500).json({
                message: "Could not start registration"
            });
        }

        // Lock this event row so concurrent registrations
        // must wait before checking available capacity.
        db.query(
            `SELECT id, capacity, event_date
             FROM events
             WHERE id = ?
             FOR UPDATE`,
            [eventId],
            (eventErr, events) => {
                if (eventErr) {
                    return rollback(
                        res,
                        "Could not check event",
                        eventErr
                    );
                }

                if (events.length === 0) {
                    return rollback(
                        res,
                        "Event not found",
                        null,
                        404
                    );
                }

                const event = events[0];

                if (
                    !event.event_date ||
                    new Date(event.event_date) <= new Date()
                ) {
                    return rollback(
                        res,
                        "Registration is closed for this event",
                        null,
                        400
                    );
                }

                // Check whether this student is already registered.
                db.query(
                    `SELECT id
                     FROM registrations
                     WHERE user_id = ? AND event_id = ?`,
                    [userId, eventId],
                    (duplicateErr, existing) => {
                        if (duplicateErr) {
                            return rollback(
                                res,
                                "Could not check registration",
                                duplicateErr
                            );
                        }

                        if (existing.length > 0) {
                            return rollback(
                                res,
                                "You are already registered",
                                null,
                                409
                            );
                        }

                        // Count registrations while holding the event lock.
                        db.query(
                            `SELECT COUNT(*) AS registered_count
                             FROM registrations
                             WHERE event_id = ?`,
                            [eventId],
                            (countErr, counts) => {
                                if (countErr) {
                                    return rollback(
                                        res,
                                        "Could not check event capacity",
                                        countErr
                                    );
                                }

                                const capacity = event.capacity;
                                const registeredCount =
                                    Number(counts[0].registered_count);

                                if (
                                    capacity !== null &&
                                    registeredCount >= Number(capacity)
                                ) {
                                    return rollback(
                                        res,
                                        "This event is full",
                                        null,
                                        400
                                    );
                                }

                                // Insert registration inside the transaction.
                                db.query(
                                    `INSERT INTO registrations
                                     (user_id, event_id)
                                     VALUES (?, ?)`,
                                    [userId, eventId],
                                    (insertErr, result) => {
                                        if (insertErr) {
                                            const status =
                                                insertErr.code === "ER_DUP_ENTRY"
                                                    ? 409
                                                    : 500;

                                            return rollback(
                                                res,
                                                status === 409
                                                    ? "You are already registered"
                                                    : "Registration failed",
                                                insertErr,
                                                status
                                            );
                                        }

                                        db.commit((commitErr) => {
                                            if (commitErr) {
                                                console.error(commitErr);

                                                // A commit error can leave the
                                                // transaction outcome uncertain.
                                                return res.status(500).json({
                                                    message:
                                                        "Could not confirm registration. Please check your registrations before retrying."
                                                });
                                            }

                                            return res.status(201).json({
                                                message:
                                                    "Event registration successful",
                                                registrationId: result.insertId
                                            });
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
};

// Roll back a failed registration transaction.
const rollback = (res, message, error = null, status = 500) => {
    if (error) {
        console.error(error);
    }

    db.rollback((rollbackErr) => {
        if (rollbackErr) {
            console.error("Transaction rollback failed:", rollbackErr);
        }

        return res.status(status).json({ message });
    });
};

// Get registrations belonging to the logged-in student.
const getMyRegistrations = (req, res) => {
    const sql = `
        SELECT
            r.id AS registration_id,
            r.registered_at,
            e.id AS event_id,
            e.title,
            e.description,
            e.event_date,
            e.location,
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