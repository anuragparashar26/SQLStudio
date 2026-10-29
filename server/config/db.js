const mongoose = require("mongoose");
const { Pool } = require("pg");

// MongoDB Connection
let mongoConnection;

const connectMongo = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    if (!mongoConnection) {
        mongoConnection = mongoose
            .connect(process.env.MONGO_URI)
            .then(() => {
                console.log("MongoDB connected");
                return mongoose.connection;
            })
            .catch((err) => {
                mongoConnection = undefined;
                console.error("MongoDB connection error:", err.message);
                throw err;
            });
    }

    return mongoConnection;
};

// PostgreSQL Pool
const pgPool = new Pool({
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT, 10),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    // Safety: kill any query that runs longer than 5 seconds
    statement_timeout: 5000,
    // SSL: required by cloud providers
    ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : false,
});

pgPool.on("error", (err) => {
    console.error("PostgreSQL pool error:", err.message);
});

module.exports = { connectMongo, pgPool };
