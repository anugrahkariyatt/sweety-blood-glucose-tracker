import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";

import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

describe("Reports API", () => {
    let agent;
    let userId;

    const testEmail = `report-${randomUUID()}@example.com`;
    const testPassword = "password123";

    before(async () => {
        await prisma.$connect();

        const hashedPassword = await bcrypt.hash(testPassword, 12);
        const user = await prisma.user.create({
            data: {
                name: "Report Test User",
                email: testEmail,
                password: hashedPassword,
            },
        });

        userId = user.id;

        agent = request.agent(app);

        const loginResponse = await agent
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password: testPassword,
            });

        assert.equal(loginResponse.status, 200);

        // 3. Seed sample readings across September and October 2026
        const sampleReadings = [
            // September 2026 (Previous Month)
            { date: "2026-09-05", slot: "MORNING", value: 90 },
            { date: "2026-09-15", slot: "AFTER_LUNCH", value: 140 },
            { date: "2026-09-30", slot: "AFTER_DINNER", value: 170 },

            // October 2026 (Current Month)
            { date: "2026-10-01", slot: "MORNING", value: 100 },
            { date: "2026-10-05", slot: "AFTER_BREAKFAST", value: 130 },
            { date: "2026-10-10", slot: "AFTER_LUNCH", value: 145 },
            { date: "2026-10-15", slot: "MORNING", value: 95 },
            { date: "2026-10-15", slot: "AFTER_BREAKFAST", value: 120 },
            { date: "2026-10-15", slot: "AFTER_DINNER", value: 160 },
        ];

        for (const reading of sampleReadings) {
            const response = await agent
                .post("/api/readings")
                .send(reading);

            assert.equal(
                response.status,
                201,
                `Failed to create sample reading: ${JSON.stringify(reading)}`
            );
        }
    });

    after(async () => {
        if (userId) {
            await prisma.reading.deleteMany({
                where: { userId },
            });

            await prisma.user.deleteMany({
                where: { id: userId },
            });
        }

        await prisma.$disconnect();
    });

    // 1. Daily Report Tests
    describe("GET /api/reports/daily", () => {
        it("should generate a daily report for a selected date with readings", async () => {
            const response = await agent
                .get("/api/reports/daily?date=2026-10-15");

            assert.equal(response.status, 200);
            assert.equal(response.body.success, true);

            const report = response.body.data;
            assert.equal(report.date, "2026-10-15");
            assert.equal(report.count, 3);
            assert.equal(report.highest, 160);
            assert.equal(report.lowest, 95);
            assert.equal(report.average, 125.0);
            assert.equal(report.readings.length, 3);
            assert.ok(report.readings[0].slot);
        });

        it("should return a friendly empty state when no readings exist for the date", async () => {
            const response = await agent
                .get("/api/reports/daily?date=2026-10-14");

            assert.equal(response.status, 200);
            assert.equal(response.body.success, true);

            const report = response.body.data;
            assert.equal(report.count, 0);
            assert.equal(report.highest, null);
            assert.equal(report.lowest, null);
            assert.equal(report.average, null);
            assert.deepEqual(report.readings, []);
            assert.equal(report.message, "No readings found for this date.");
        });

        it("should reject daily report request without date query parameter", async () => {
            const response = await agent
                .get("/api/reports/daily");

            assert.equal(response.status, 400);
            assert.equal(response.body.success, false);
            assert.equal(response.body.message, "Please select a date.");
        });

        it("should reject daily report request without authentication", async () => {
            const response = await request(app)
                .get("/api/reports/daily?date=2026-10-15");

            assert.equal(response.status, 401);
            assert.equal(response.body.success, false);
        });
    });

    // 2. Month-to-Date Report Tests
    describe("GET /api/reports/month-to-date", () => {
        it("should calculate correct stats from 1st of month to selected date", async () => {
           
            const response = await agent
                .get("/api/reports/month-to-date?date=2026-10-15");

            assert.equal(response.status, 200);
            assert.equal(response.body.success, true);

            const report = response.body.data;
            assert.equal(report.startDate, "2026-10-01");
            assert.equal(report.endDate, "2026-10-15");
            assert.equal(report.count, 6);
            assert.equal(report.highest, 160);
            assert.equal(report.lowest, 95);
            assert.equal(report.average, 125.0);
        });

        it("should return empty state when no readings exist in month-to-date range", async () => {
            const response = await agent
                .get("/api/reports/month-to-date?date=2026-08-15");

            assert.equal(response.status, 200);
            assert.equal(response.body.success, true);

            const report = response.body.data;
            assert.equal(report.startDate, "2026-08-01");
            assert.equal(report.endDate, "2026-08-15");
            assert.equal(report.count, 0);
            assert.equal(report.highest, null);
            assert.equal(report.lowest, null);
            assert.equal(report.average, null);
            assert.equal(report.message, "No readings found for this period.");
        });

        it("should reject month-to-date report request without authentication", async () => {
            const response = await request(app)
                .get("/api/reports/month-to-date?date=2026-10-15");

            assert.equal(response.status, 401);
            assert.equal(response.body.success, false);
        });
    });

    // 3. Monthly Report Tests (Previous Month)
    describe("GET /api/reports/monthly", () => {
        it("should calculate correct stats for the whole previous month", async () => {
            
            const response = await agent
                .get("/api/reports/monthly?date=2026-10-15");

            assert.equal(response.status, 200);
            assert.equal(response.body.success, true);

            const report = response.body.data;
            assert.equal(report.startDate, "2026-09-01");
            assert.equal(report.endDate, "2026-09-30");
            assert.equal(report.count, 3);
            assert.equal(report.highest, 170);
            assert.equal(report.lowest, 90);
            assert.equal(report.average, 133.3);
        });

        it("should handle year rollover when selected date is in January", async () => {
            const response = await agent
                .get("/api/reports/monthly?date=2026-01-10");

            assert.equal(response.status, 200);
            assert.equal(response.body.success, true);

            const report = response.body.data;
            assert.equal(report.startDate, "2025-12-01");
            assert.equal(report.endDate, "2025-12-31");
            assert.equal(report.count, 0);
            assert.equal(report.highest, null);
            assert.equal(report.message, "No readings found for this period.");
        });

        it("should reject monthly report request without authentication", async () => {
            const response = await request(app)
                .get("/api/reports/monthly?date=2026-10-15");

            assert.equal(response.status, 401);
            assert.equal(response.body.success, false);
        });
    });
});
