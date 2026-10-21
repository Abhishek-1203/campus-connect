
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const certificateTemplateRoutes = require("./routes/certificateTemplateRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");

// API welcome route
app.get("/api", (req, res) => {
    res.json({
        message: "Welcome to CampusConnect API"
    });
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/certificate-templates", certificateTemplateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);

// Serve uploaded files
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// Start server
app.listen(PORT, () => {
    console.log(`CampusConnect server running on port ${PORT}`);
});
