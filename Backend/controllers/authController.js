
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')",
            [name, email, hashedPassword],
            (err, result) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            message: "Email is already registered"
                        });
                    }

                    console.error(err);
                    return res.status(500).json({
                        message: "Could not register user"
                    });
                }

                return res.status(201).json({
                    message: "Student registered successfully",
                    userId: result.insertId
                });
            }
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error during registration"
        });
    }
};

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    db.query(
        "SELECT id, name, email, password, role FROM users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Login failed"
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const user = results[0];

            try {
                const validPassword = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!validPassword) {
                    return res.status(401).json({
                        message: "Invalid email or password"
                    });
                }

                const secret = process.env.JWT_SECRET;

                if (!secret) {
                    return res.status(500).json({
                        message: "Authentication is not configured"
                    });
                }

                const token = jwt.sign(
                    { id: user.id, role: user.role },
                    secret,
                    { expiresIn: "1d" }
                );

                return res.json({
                    message: "Login successful",
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    message: "Server error during login"
                });
            }
        }
    );
};

module.exports = { register, login };