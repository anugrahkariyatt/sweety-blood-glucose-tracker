
import express from "express";
import validate from "../middleware/validate.middleware.js";
import { registerSchema } from "../validators/auth.validator.js";
import { register } from "../controllers/auth.controller.js";

const router = express.Router();

// Register user
router.post("/register", validate(registerSchema), register);

export default router;
