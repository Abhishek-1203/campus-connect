
const express = require("express");
const router = express.Router();

const {
    registerForEvent,
    getMyRegistrations
} = require("../controllers/registrationController");

const authMiddleware = require("../middleware/authMiddleware");

// Register for an event
router.post("/:eventId", authMiddleware, registerForEvent);

// View my registered events
router.get("/my", authMiddleware, getMyRegistrations);

module.exports = router;