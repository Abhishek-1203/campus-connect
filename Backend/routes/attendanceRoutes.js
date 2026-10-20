const express = require("express");
const router = express.Router();

const {
    getEventAttendance,
    markAttendance
} = require("../controllers/attendanceController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// View attendance for an event — admins only
router.get(
    "/event/:eventId",
    authMiddleware,
    adminMiddleware,
    getEventAttendance
);

// Mark or update attendance — admins only
router.patch(
    "/:registrationId",
    authMiddleware,
    adminMiddleware,
    markAttendance
);

module.exports = router;