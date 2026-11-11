
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import reportRoutes from "./routes/report.routes.js";
import authRoutes from "./routes/auth.routes.js";
import readingRoutes from "./routes/reading.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";


const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Sweety API is running!",
    });
});
// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/reports", reportRoutes);
app.use(errorMiddleware);



export default app;
