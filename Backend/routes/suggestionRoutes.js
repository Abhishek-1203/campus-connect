
const express = require("express");
const router = express.Router();

const {
    createSuggestion,
    getMySuggestions,
    getAllSuggestions,
    updateSuggestionStatus
} = require("../controllers/suggestionController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Student routes
router.post("/", authMiddleware, createSuggestion);
router.get("/my", authMiddleware, getMySuggestions);

// Admin routes
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllSuggestions
);

router.patch(
    "/:id/status",
    authMiddleware,
    adminMiddleware,
    updateSuggestionStatus
);

module.exports = router;
