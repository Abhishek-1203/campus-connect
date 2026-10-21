
const db = require("../config/db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const certificateDir = path.join(
    __dirname,
    "../uploads/certificates"
);

const templateDir = path.join(
    __dirname,
    "../uploads/certificate-templates"
);

fs.mkdirSync(certificateDir, { recursive: true });

// Get certificates belonging to the logged-in student
const getMyCertificates = (req, res) => {
    const sql = `
        SELECT
            c.id AS certificate_id,
            c.certificate_url,
            c.issued_at,
            e.id AS event_id,
            e.title AS event_title
        FROM certificates c
        JOIN events e ON c.event_id = e.id
        WHERE c.user_id = ?
        ORDER BY c.issued_at DESC
    `;

    db.query(sql, [req.user.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch certificates"
            });
        }

        return res.json(results);
    });
};

// Generate and issue a certificate using the selected event's template
const issueCertificate = (req, res) => {
    const userId = Number(req.body.user_id);
    const eventId = Number(req.body.event_id);

    if (
        !Number.isInteger(userId) || userId < 1 ||
        !Number.isInteger(eventId) || eventId < 1
    ) {
        return res.status(400).json({
            message: "Valid user_id and event_id are required"
        });
    }

    const sql = `
        SELECT
            u.id AS user_id,
            u.name AS student_name,
            e.id AS event_id,
            e.title AS event_title,
            t.template_filename
        FROM registrations r
        JOIN users u ON u.id = r.user_id
        JOIN events e ON e.id = r.event_id
        LEFT JOIN event_certificate_templates t
            ON t.event_id = e.id
        WHERE r.user_id = ?
          AND r.event_id = ?
          AND u.role = 'student'
        LIMIT 1
    `;

    db.query(sql, [userId, eventId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to retrieve student, event, and template details"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Registered student not found for this event"
            });
        }

        const student = results[0];

        if (!student.template_filename) {
            return res.status(400).json({
                message: "Upload a certificate template for this event first"
            });
        }

        const templatePath = path.join(
            templateDir,
            path.basename(student.template_filename)
        );

        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({
                message: "The uploaded event certificate template file was not found"
            });
        }

        const extension = path.extname(templatePath).toLowerCase();

        // PDF templates need a PDF background-merging library.
        // This implementation uses image templates.
        if (![".png", ".jpg", ".jpeg"].includes(extension)) {
            return res.status(400).json({
                message: "The uploaded template must be PNG or JPG to generate certificates with this version"
            });
        }

        const certificateId = `CC-${Date.now()}-${userId}`;
        const filename = `${certificateId}.pdf`;
        const filePath = path.join(certificateDir, filename);
        const certificateUrl = `/uploads/certificates/${filename}`;

        const issueDate = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        const doc = new PDFDocument({
            size: "A4",
            layout: "landscape",
            margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });

        const stream = fs.createWriteStream(filePath);
        let handled = false;

        stream.on("error", (fileErr) => {
            console.error("Certificate file error:", fileErr);

            if (!handled) {
                handled = true;
                return res.status(500).json({
                    message: "Failed to generate certificate PDF"
                });
            }
        });

        doc.on("error", (pdfErr) => {
            console.error("Certificate PDF error:", pdfErr);

            if (!handled) {
                handled = true;
                stream.destroy();
                return res.status(500).json({
                    message: "Failed to create certificate PDF"
                });
            }
        });

        doc.pipe(stream);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        try {
            // Use this event's uploaded image as the PDF background
            doc.image(templatePath, 0, 0, {
                width: pageWidth,
                height: pageHeight
            });

            // Cover the sample recipient placeholder
            doc.save();
            doc.fillColor("#F8F5ED")
                .rect(180, 245, pageWidth - 260, 55)
                .fill();
            doc.restore();

            // Student name
            doc.fillColor("#10294B")
                .font("Helvetica")
                .fontSize(27)
                .text(student.student_name, 180, 252, {
                    width: pageWidth - 260,
                    align: "center",
                    lineBreak: false,
                    ellipsis: true
                });

            // Cover the sample event-name placeholder
            doc.save();
            doc.fillColor("#F8F5ED")
                .rect(230, 340, pageWidth - 330, 35)
                .fill();
            doc.restore();

            // Event name
            doc.fillColor("#10294B")
                .font("Helvetica-Bold")
                .fontSize(19)
                .text(student.event_title, 230, 344, {
                    width: pageWidth - 330,
                    align: "center",
                    lineBreak: false,
                    ellipsis: true
                });

            // Date in the date area
            doc.fillColor("#10294B")
                .font("Helvetica")
                .fontSize(11)
                .text(issueDate, 230, 493, {
                    width: 150,
                    align: "center",
                    lineBreak: false
                });

            doc.end();

            stream.on("finish", () => {
                if (handled) return;

                const insertSql = `
                    INSERT INTO certificates
                        (user_id, event_id, certificate_url)
                    VALUES (?, ?, ?)
                `;

                db.query(
                    insertSql,
                    [userId, eventId, certificateUrl],
                    (insertErr, result) => {
                        if (insertErr) {
                            console.error(insertErr);

                            fs.unlink(filePath, () => {});

                            if (!handled) {
                                handled = true;
                                return res.status(500).json({
                                    message: "PDF generated, but certificate could not be saved"
                                });
                            }

                            return;
                        }

                        if (handled) return;
                        handled = true;

                        return res.status(201).json({
                            message: "Certificate generated and issued successfully",
                            certificate_id: result.insertId,
                            student_name: student.student_name,
                            event_title: student.event_title,
                            certificate_url: certificateUrl
                        });
                    }
                );
            });
        } catch (generationErr) {
            console.error("Certificate generation error:", generationErr);
            handled = true;
            stream.destroy();

            return res.status(500).json({
                message: "Could not generate the certificate from the uploaded template"
            });
        }
    });
};

module.exports = {
    getMyCertificates,
    issueCertificate
};
