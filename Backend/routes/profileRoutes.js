
const express = require("express");
const router = express.Router();

const {
    getMyProfile,
    updateMyProfile
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

// Get the logged-in user's profile
router.get("/me", authMiddleware, getMyProfile);

// Update the logged-in user's profile
router.put("/me", authMiddleware, updateMyProfile);

module.exports = router;
