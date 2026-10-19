
const express = require("express");
const router = express.Router();

const {
    getMyNotifications,
    markNotificationRead
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

// View the logged-in student's notifications
router.get("/my", authMiddleware, getMyNotifications);

// Mark one of the student's notifications as read
router.patch("/:id/read", authMiddleware, markNotificationRead);

module.exports = router;
