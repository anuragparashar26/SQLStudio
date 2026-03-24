const express = require("express");
const cors = require("cors");

const assignmentRoutes = require("./routes/assignments");
const executeRoutes = require("./routes/execute");
const hintRoutes = require("./routes/hint");

const app = express();

const parseOrigins = (raw = "") =>
    raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

const allowedOrigins = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sql-studio-cipher-schools-pi.vercel.app",
    ...parseOrigins(process.env.CORS_ORIGINS),
]);

const vercelCustomDomain = process.env.VERCEL_CUSTOM_DOMAIN;

// --- Middleware ---
app.use(
    cors({
        origin(origin, callback) {
            if (!origin) return callback(null, true);

            if (allowedOrigins.has(origin)) {
                return callback(null, true);
            }

            if (origin.endsWith(".vercel.app")) {
                return callback(null, true);
            }

            if (vercelCustomDomain && origin === `https://${vercelCustomDomain}`) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
    })
);
app.use(express.json());

// --- Routes ---
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "CipherSQLStudio API is running" });
});

app.use("/api/assignments", assignmentRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/hint", hintRoutes);

// --- 404 handler ---
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// --- Error handler ---
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
