
const express = require("express");
const router = express.Router();

const {
    getDashboardStats,
    getEventParticipants
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Admin dashboard statistics
router.get(
    "/dashboard",
    authMiddleware,
    adminMiddleware,
    getDashboardStats
);

// Participants registered for a specific event
router.get(
    "/events/:eventId/participants",
    authMiddleware,
    adminMiddleware,
    getEventParticipants
);

module.exports = router;
