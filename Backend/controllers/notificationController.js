
const db = require("../config/db");

// Get notifications for the logged-in student
const getMyNotifications = (req, res) => {
    const sql = `
        SELECT id, message, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [req.user.id], (err, results) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Failed to fetch notifications"
            });
        }

        return res.json(results);
    });
};

// Mark a notification as read
const markNotificationRead = (req, res) => {
    const notificationId = Number(req.params.id);

    if (!Number.isInteger(notificationId) || notificationId < 1) {
        return res.status(400).json({
            message: "Invalid notification ID"
        });
    }

    const sql = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = ? AND user_id = ?
    `;

    db.query(
        sql,
        [notificationId, req.user.id],
        (err, result) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to update notification"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Notification not found"
                });
            }

            return res.json({
                message: "Notification marked as read"
            });
        }
    );
};

module.exports = {
    getMyNotifications,
    markNotificationRead
};
