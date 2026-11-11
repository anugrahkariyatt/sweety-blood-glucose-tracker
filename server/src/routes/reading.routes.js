import express from "express";
import validate from "../middleware/validate.middleware.js";
import protect from "../middleware/auth.middleware.js";
import { createReadingSchema } from "../validators/reading.validator.js";
import { createReading } from "../controllers/reading.controller.js";

const router = express.Router();

router.post("/", protect, validate(createReadingSchema), createReading);

export default router;