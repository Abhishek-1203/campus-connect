
const db = require("../config/db");

// Get all events
const getAllEvents = (req, res) => {
    const sql = `
        SELECT
            e.id,
            e.title,
            e.description,
            e.event_date,
            e.venue,
            e.venue AS location,
            e.capacity,
            e.created_by,
            e.created_at,
            u.name AS admin_name
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        ORDER BY e.event_date ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Get events error:", err);
            return res.status(500).json({
                message: "Failed to fetch events"
            });
        }

        return res.json(results);
    });
};

// Get one event
const getEventById = (req, res) => {
    const eventId = Number(req.params.id);

    if (!Number.isInteger(eventId) || eventId < 1) {
        return res.status(400).json({
            message: "Invalid event ID"
        });
    }

    const sql = `
        SELECT
            e.id,
            e.title,
            e.description,
            e.event_date,
            e.venue,
            e.venue AS location,
            e.capacity,
            e.created_by,
            e.created_at,
            u.name AS admin_name
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        WHERE e.id = ?
    `;

    db.query(sql, [eventId], (err, results) => {
        if (err) {
            console.error("Get event error:", err);
            return res.status(500).json({
                message: "Failed to fetch event"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        return res.json(results[0]);
    });
};

// Create event (admin only)
const createEvent = (req, res) => {
    const {
        title,
        description,
        event_date,
        capacity
    } = req.body;

    // Accept either frontend field name
    const venue = req.body.venue ?? req.body.location;

    if (
        typeof title !== "string" ||
        !title.trim() ||
        !event_date ||
        typeof venue !== "string" ||
        !venue.trim()
    ) {
        return res.status(400).json({
            message: "Title, event date, and venue are required"
        });
    }

    const parsedCapacity = Number(capacity ?? 100);

    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
        return res.status(400).json({
            message: "Capacity must be a positive whole number"
        });
    }

    const sql = `
        INSERT INTO events
        (title, description, event_date, venue, capacity, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            title.trim(),
            description || null,
            event_date,
            venue.trim(),
            parsedCapacity,
            req.user.id
        ],
        (err, result) => {
            if (err) {
                console.error("Create event error:", err);
                return res.status(500).json({
                    message: "Failed to create event"
                });
            }

            return res.status(201).json({
                message: "Event created successfully",
                eventId: result.insertId
            });
        }
    );
};

// Update event (admin only)
const updateEvent = (req, res) => {
    const eventId = Number(req.params.id);

    const {
        title,
        description,
        event_date,
        capacity
    } = req.body;

    const venue = req.body.venue ?? req.body.location;

    if (!Number.isInteger(eventId) || eventId < 1) {
        return res.status(400).json({
            message: "Invalid event ID"
        });
    }

    if (
        typeof title !== "string" ||
        !title.trim() ||
        !event_date ||
        typeof venue !== "string" ||
        !venue.trim()
    ) {
        return res.status(400).json({
            message: "Title, event date, and venue are required"
        });
    }

    const parsedCapacity = Number(capacity);

    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
        return res.status(400).json({
            message: "Capacity must be a positive whole number"
        });
    }

    const sql = `
        UPDATE events
        SET title = ?,
            description = ?,
            event_date = ?,
            venue = ?,
            capacity = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            title.trim(),
            description || null,
            event_date,
            venue.trim(),
            parsedCapacity,
            eventId
        ],
        (err, result) => {
            if (err) {
                console.error("Update event error:", err);
                return res.status(500).json({
                    message: "Failed to update event"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Event not found"
                });
            }

            return res.json({
                message: "Event updated successfully"
            });
        }
    );
};

// Delete event (admin only)
const deleteEvent = (req, res) => {
    const eventId = Number(req.params.id);

    if (!Number.isInteger(eventId) || eventId < 1) {
        return res.status(400).json({
            message: "Invalid event ID"
        });
    }

    const sql = "DELETE FROM events WHERE id = ?";

    db.query(sql, [eventId], (err, result) => {
        if (err) {
            console.error("Delete event error:", err);
            return res.status(500).json({
                message: "Failed to delete event"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        return res.json({
            message: "Event deleted successfully"
        });
    });
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};
