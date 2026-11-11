import express from "express";
import protect from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { reportQuerySchema } from "../validators/report.validator.js";
import {
    getDailyReport,
    getMonthToDateReport,
    getMonthlyReport,
} from "../controllers/report.controller.js";

const router = express.Router();

router.get("/daily", protect, validate(reportQuerySchema, "query"), getDailyReport);
router.get("/month-to-date", protect, validate(reportQuerySchema, "query"), getMonthToDateReport);
router.get("/monthly", protect, validate(reportQuerySchema, "query"), getMonthlyReport);

export default router;
