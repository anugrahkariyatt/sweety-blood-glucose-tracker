
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";

import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

const testEmail = `test-${randomUUID()}@example.com`;

describe("Authentication API - Registration", () => {
    before(async () => {
        await prisma.$connect();
    });

    after(async () => {
        // Remove the test user created during these tests
        await prisma.user.deleteMany({
            where: { email: testEmail },
        });

        await prisma.$disconnect();
    });

    it("should register a new user successfully", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: testEmail,
                password: "password123",
            });

        assert.equal(response.status, 201);
        assert.equal(response.body.success, true);
        assert.equal(
            response.body.message,
            "Account created successfully."
        );

        assert.equal(response.body.data.user.email, testEmail);
        assert.equal(response.body.data.user.name, "Test User");

        assert.equal(response.body.data.user.password, undefined);
    });

    it("should reject invalid registration data", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "",
                email: "invalid-email",
                password: "123",
            });

        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
    });

    it("should reject duplicate email registration", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Another User",
                email: testEmail,
                password: "password123",
            });

        assert.equal(response.status, 409);
        assert.equal(response.body.success, false);
        assert.equal(
            response.body.message,
            "Email already registered."
        );
    });

    it("should store the password as a bcrypt hash", async () => {
        const user = await prisma.user.findUnique({
            where: { email: testEmail },
        });

        assert.ok(user);
        assert.notEqual(user.password, "password123");

        const isPasswordValid = await bcrypt.compare(
            "password123",
            user.password
        );

        assert.equal(isPasswordValid, true);
    });
});
