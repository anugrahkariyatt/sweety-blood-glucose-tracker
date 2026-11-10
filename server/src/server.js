
import express from "express";
import "dotenv/config";
import pool from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Sweety API is running!",
    });
});

const startServer = async () => {
    try {
        const result = await pool.query("SELECT NOW()");

        console.log("PostgreSQL connected successfully!");
        console.log("Database time:", result.rows[0].now);

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

startServer();
