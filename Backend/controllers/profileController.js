
const db = require("../config/db");

// Get the logged-in student's profile
const getMyProfile = (req, res) => {
    const sql = `
        SELECT id, name, email, role, created_at
        FROM users
        WHERE id = ?
    `;

    db.query(sql, [req.user.id], (err, results) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Failed to fetch profile"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.json(results[0]);
    });
};

// Update the logged-in student's profile
const updateMyProfile = (req, res) => {
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            message: "A valid name is required"
        });
    }

    if (name.trim().length > 100) {
        return res.status(400).json({
            message: "Name must be 100 characters or fewer"
        });
    }

    const sql = "UPDATE users SET name = ? WHERE id = ?";

    db.query(sql, [name.trim(), req.user.id], (err, result) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Failed to update profile"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.json({
            message: "Profile updated successfully"
        });
    });
};

module.exports = {
    getMyProfile,
    updateMyProfile
};
