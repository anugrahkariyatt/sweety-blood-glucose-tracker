import express from "express";
import validate from "../middleware/validate.middleware.js";
import protect from "../middleware/auth.middleware.js";
import { createReadingSchema } from "../validators/reading.validator.js";
import { createReading, getReadings, getReadingById } from "../controllers/reading.controller.js";

const router = express.Router();

router.post("/", protect, validate(createReadingSchema), createReading);
router.get("/", protect, getReadings);
router.get("/:id", protect, getReadingById);

export default router;