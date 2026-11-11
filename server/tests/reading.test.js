
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { randomUUID } from "node:crypto";

import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

describe("Reading API - CRUD Operations", () => {
    const testEmail = `reading-${randomUUID()}@example.com`;
    const password = "password123";

    let agent;
    let userId;
    let readingId;

    before(async () => {
        await prisma.$connect();

        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Reading Test User",
                email: testEmail,
                password,
            });

        assert.equal(registerResponse.status, 201);

        const user = await prisma.user.findUnique({
            where: { email: testEmail },
        });

        assert.ok(user);
        userId = user.id;

        agent = request.agent(app);

        const loginResponse = await agent
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password,
            });

        assert.equal(loginResponse.status, 200);
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


    it("should create a reading successfully", async () => {
        const response = await agent
            .post("/api/readings")
            .send({
                date: "2026-11-10",
                slot: "MORNING",
                value: 120,
            });

        assert.equal(response.status, 201);
        assert.equal(response.body.success, true);
        assert.equal(
            response.body.message,
            "Reading created successfully."
        );

        assert.equal(response.body.data.value, 120);
        assert.equal(response.body.data.slot, "MORNING");

        readingId = response.body.data.id;

        const reading = await prisma.reading.findUnique({
            where: { id: readingId },
        });

        assert.ok(reading);
        assert.equal(reading.userId, userId);
        assert.equal(reading.value, 120);
    });
    it("should reject duplicate reading slots for the same date", async () => {
        const readingData = {
            date: "2026-11-10",
            slot: "MORNING",
            value: 130,
        };

        const response = await agent
            .post("/api/readings")
            .send(readingData);

        assert.equal(response.status, 409);
        assert.equal(response.body.success, false);
        assert.equal(
            response.body.message,
            "You already have a Morning reading for this date."
        );
    });
    it("should reject more than 4 readings per day", async () => {
        const slots = [
            "MORNING",
            "AFTER_BREAKFAST",
            "AFTER_LUNCH",
            "AFTER_DINNER",
        ];

        for (const slot of slots) {
            const response = await agent
                .post("/api/readings")
                .send({
                    date: "2026-11-09",
                    slot,
                    value: 120,
                });

            assert.equal(response.status, 201);
        }

        const response = await agent
            .post("/api/readings")
            .send({
                date: "2026-11-09",
                slot: "MORNING",
                value: 130,
            });

        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
        assert.equal(
            response.body.message,
            "You can add only 4 readings per day."
        );
    });

    it("should reject invalid reading data", async () => {
        const response = await agent
            .post("/api/readings")
            .send({
                date: "invalid-date",
                slot: "NIGHT",
                value: 700,
            });

        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
    });

    it("should reject reading creation without authentication", async () => {
        const response = await request(app)
            .post("/api/readings")
            .send({
                date: "2026-11-10",
                slot: "MORNING",
                value: 120,
            });

        assert.equal(response.status, 401);
        assert.equal(response.body.success, false);
    });

    it("should get all readings for the authenticated user", async () => {
        const response = await agent.get("/api/readings");

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.ok(Array.isArray(response.body.data));
        assert.ok(response.body.data.length >= 1);
    });

    it("should reject getting readings without authentication", async () => {
        const response = await request(app)
            .get("/api/readings");

        assert.equal(response.status, 401);
        assert.equal(response.body.success, false);
    });

    it("should get a reading by ID", async () => {
        const response = await agent
            .get(`/api/readings/${readingId}`);

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.equal(response.body.data.id, readingId);
        assert.equal(response.body.data.value, 120);
    });

    it("should return 404 for a non-existing reading", async () => {
        const response = await agent
            .get(`/api/readings/${randomUUID()}`);

        assert.equal(response.status, 404);
        assert.equal(response.body.success, false);
    });

    it("should reject getting a reading without authentication", async () => {
        const response = await request(app)
            .get(`/api/readings/${readingId}`);

        assert.equal(response.status, 401);
        assert.equal(response.body.success, false);
    });

    it("should update a reading successfully", async () => {
        const response = await agent
            .patch(`/api/readings/${readingId}`)
            .send({
                value: 150,
            });

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.equal(
            response.body.message,
            "Reading updated successfully."
        );
        assert.equal(response.body.data.value, 150);

        // Verify database update
        const reading = await prisma.reading.findUnique({
            where: { id: readingId },
        });

        assert.equal(reading.value, 150);
    });

    it("should reject invalid reading updates", async () => {
        const response = await agent
            .patch(`/api/readings/${readingId}`)
            .send({
                value: 700,
            });

        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
    });

    it("should return 404 when updating a non-existing reading", async () => {
        const response = await agent
            .patch(`/api/readings/${randomUUID()}`)
            .send({
                value: 160,
            });

        assert.equal(response.status, 404);
        assert.equal(response.body.success, false);
    });

    it("should reject updating a reading without authentication", async () => {
        const response = await request(app)
            .patch(`/api/readings/${readingId}`)
            .send({
                value: 150,
            });

        assert.equal(response.status, 401);
        assert.equal(response.body.success, false);
    });

    it("should delete a reading successfully", async () => {
        const response = await agent
            .delete(`/api/readings/${readingId}`);

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.equal(
            response.body.message,
            "Reading deleted successfully."
        );

        // Verify database deletion
        const reading = await prisma.reading.findUnique({
            where: { id: readingId },
        });

        assert.equal(reading, null);
    });

    it("should return 404 when deleting a non-existing reading", async () => {
        const response = await agent
            .delete(`/api/readings/${randomUUID()}`);

        assert.equal(response.status, 404);
        assert.equal(response.body.success, false);
    });

    it("should reject deleting a reading without authentication", async () => {
        const response = await request(app)
            .delete(`/api/readings/${randomUUID()}`);

        assert.equal(response.status, 401);
        assert.equal(response.body.success, false);
    });

});
