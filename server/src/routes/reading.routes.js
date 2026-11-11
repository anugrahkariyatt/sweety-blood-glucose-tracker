import express from "express";
import validate from "../middleware/validate.middleware.js";
import protect from "../middleware/auth.middleware.js";
import { createReadingSchema, updateReadingSchema } from "../validators/reading.validator.js";
import { createReading, getReadings, getReadingById, updateReading } from "../controllers/reading.controller.js";

const router = express.Router();

router.post("/", protect, validate(createReadingSchema), createReading);
router.get("/", protect, getReadings);
router.get("/:id", protect, getReadingById);
router.patch("/:id", protect, validate(updateReadingSchema), updateReading);

export default router;