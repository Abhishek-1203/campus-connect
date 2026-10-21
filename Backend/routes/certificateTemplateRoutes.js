
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const uploadDir = path.join(
    __dirname,
    "../uploads/certificate-templates"
);

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeName = `event-template-${req.params.eventId}-${Date.now()}${extension}`;
        cb(null, safeName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    cb(new Error("Only PDF, PNG, and JPG files are allowed."));
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// Upload or replace the certificate template for one event
router.post(
    "/:eventId/upload",
    authMiddleware,
    adminMiddleware,
    (req, res, next) => {
        const eventId = Number(req.params.eventId);

        if (!Number.isInteger(eventId) || eventId < 1) {
            return res.status(400).json({
                message: "A valid event ID is required."
            });
        }

        req.eventId = eventId;
        next();
    },
    upload.single("template"),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select a certificate template."
            });
        }

        const eventId = req.eventId;
        const filename = req.file.filename;

        // Verify the event exists before saving its template
        db.query(
            "SELECT id FROM events WHERE id = ?",
            [eventId],
            (eventErr, events) => {
                if (eventErr) {
                    console.error(eventErr);
                    fs.unlink(req.file.path, () => {});

                    return res.status(500).json({
                        message: "Could not verify the event."
                    });
                }

                if (events.length === 0) {
                    fs.unlink(req.file.path, () => {});

                    return res.status(404).json({
                        message: "Event not found."
                    });
                }

                const sql = `
                    INSERT INTO event_certificate_templates
                        (event_id, template_filename, uploaded_by)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        template_filename = VALUES(template_filename),
                        uploaded_by = VALUES(uploaded_by),
                        uploaded_at = CURRENT_TIMESTAMP
                `;

                db.query(
                    sql,
                    [eventId, filename, req.user.id],
                    (saveErr) => {
                        if (saveErr) {
                            console.error(saveErr);
                            fs.unlink(req.file.path, () => {});

                            return res.status(500).json({
                                message: "Could not save the event template."
                            });
                        }

                        return res.status(201).json({
                            message: "Certificate template uploaded successfully.",
                            event_id: eventId,
                            filename,
                            template_url: `/uploads/certificate-templates/${filename}`
                        });
                    }
                );
            }
        );
    }
);

// Get the template associated with one event
router.get(
    "/:eventId",
    authMiddleware,
    adminMiddleware,
    (req, res) => {
        const eventId = Number(req.params.eventId);

        if (!Number.isInteger(eventId) || eventId < 1) {
            return res.status(400).json({
                message: "A valid event ID is required."
            });
        }

        const sql = `
            SELECT
                event_id,
                template_filename,
                uploaded_at
            FROM event_certificate_templates
            WHERE event_id = ?
        `;

        db.query(sql, [eventId], (err, results) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Could not retrieve the event template."
                });
            }

            if (results.length === 0) {
                return res.json({ template: null });
            }

            return res.json({
                template: {
                    ...results[0],
                    template_url: `/uploads/certificate-templates/${results[0].template_filename}`
                }
            });
        });
    }
);

module.exports = router;
