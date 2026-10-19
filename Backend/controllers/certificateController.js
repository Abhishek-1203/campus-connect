
const db = require("../config/db");

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

module.exports = {
    getMyCertificates
};
