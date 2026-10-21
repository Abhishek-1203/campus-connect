const express = require("express");
const router = express.Router();

const {
    getMyCertificates,
    issueCertificate
} = require("../controllers/certificateController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Students: view their own certificates
router.get(
    "/my",
    authMiddleware,
    getMyCertificates
);

// Admins: issue a certificate to a registered student
router.post(
    "/issue",
    authMiddleware,
    adminMiddleware,
    issueCertificate
);

module.exports = router;