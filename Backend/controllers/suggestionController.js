
const db = require("../config/db");

// Student: submit a suggestion
const createSuggestion = (req, res) => {
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({
            message: "Suggestion message is required"
        });
    }

    const sql = `
        INSERT INTO suggestions (user_id, message)
        VALUES (?, ?)
    `;

    db.query(sql, [req.user.id, message.trim()], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to submit suggestion"
            });
        }

        res.status(201).json({
            message: "Suggestion submitted successfully",
            suggestionId: result.insertId
        });
    });
};

// Student: view their suggestions
const getMySuggestions = (req, res) => {
    const sql = `
        SELECT *
        FROM suggestions
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [req.user.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch suggestions"
            });
        }

        res.json(results);
    });
};

// Admin: view all suggestions
const getAllSuggestions = (req, res) => {
    const sql = `
        SELECT s.*, u.name AS student_name, u.email AS student_email
        FROM suggestions s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch all suggestions"
            });
        }

        res.json(results);
    });
};

// Admin: update suggestion status
const updateSuggestionStatus = (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ["pending", "reviewed", "resolved"];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Status must be pending, reviewed, or resolved"
        });
    }

    const sql = "UPDATE suggestions SET status = ? WHERE id = ?";

    db.query(sql, [status, req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to update suggestion status"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Suggestion not found"
            });
        }

        res.json({
            message: "Suggestion status updated successfully"
        });
    });
};

module.exports = {
    createSuggestion,
    getMySuggestions,
    getAllSuggestions,
    updateSuggestionStatus
};
