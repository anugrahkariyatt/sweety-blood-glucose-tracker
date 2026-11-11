import express from "express";
import cors from "cors";
import "dotenv/config";
import prisma from "./config/prisma.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sweety API is running!",
  });
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected successfully via Prisma!");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
