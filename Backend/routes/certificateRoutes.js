
const express = require("express");
const router = express.Router();

const {
    getMyCertificates
} = require("../controllers/certificateController");

const authMiddleware = require("../middleware/authMiddleware");

// View certificates belonging to the logged-in student
router.get("/my", authMiddleware, getMyCertificates);

module.exports = router;
