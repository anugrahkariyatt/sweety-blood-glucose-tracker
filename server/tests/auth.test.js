import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

// 1. Registration Tests
describe("Authentication API - Registration", () => {
    const testEmail = `test-${randomUUID()}@example.com`;

    before(async () => {
        await prisma.$connect();
    });

    after(async () => {
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
        assert.equal(response.body.message, "Account created successfully.");
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
        assert.equal(response.body.message, "Email already registered.");
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

// 2. Login, Session & Logout Tests
describe("Authentication API - Login, Session & Logout", () => {
    const loginTestEmail = `login-${randomUUID()}@example.com`;
    const loginTestPassword = "password123";

    before(async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Login Test User",
                email: loginTestEmail,
                password: loginTestPassword,
            });
    });

    after(async () => {
        await prisma.user.deleteMany({
            where: { email: loginTestEmail },
        });
    });

    //Login Tests 
    it("should login successfully with valid credentials", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: loginTestEmail,
                password: loginTestPassword,
            });

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.equal(response.body.message, "Login successful.");
        assert.equal(response.body.data.user.email, loginTestEmail);
        assert.equal(response.body.data.user.password, undefined);
    });

    it("should reject an unknown email", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "unknown@example.com",
                password: loginTestPassword,
            });

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Invalid email or password.");
    });

    it("should reject an incorrect password", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: loginTestEmail,
                password: "wrongpassword",
            });

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Invalid email or password.");
    });

    it("should reject missing credentials", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: loginTestEmail,
            });

        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
    });

    it("should set an HTTP-only access token cookie", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: loginTestEmail,
                password: loginTestPassword,
            });

        assert.equal(response.status, 200);

        const cookies = response.headers["set-cookie"];
        assert.ok(cookies);

        const accessTokenCookie = cookies.find((cookie) =>
            cookie.startsWith("accessToken=")
        );
        assert.ok(accessTokenCookie);
        assert.match(accessTokenCookie, /HttpOnly/i);
    });

    it("should generate a valid JWT containing the user's ID", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: loginTestEmail,
                password: loginTestPassword,
            });

        const cookies = response.headers["set-cookie"];
        const accessTokenCookie = cookies.find((cookie) =>
            cookie.startsWith("accessToken=")
        );
        const token = accessTokenCookie.split(";")[0].split("=")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { email: loginTestEmail },
        });

        assert.equal(decoded.userId, user.id);
    });

    // current user Tests
    it("should return current user with a valid token", async () => {
        const agent = request.agent(app);

        await agent
            .post("/api/auth/login")
            .send({
                email: loginTestEmail,
                password: loginTestPassword,
            });

        const response = await agent.get("/api/auth/me");

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.equal(response.body.data.user.email, loginTestEmail);
        assert.equal(response.body.data.user.name, "Login Test User");
        assert.equal(response.body.data.user.password, undefined);
    });

    it("should reject current user request without authentication", async () => {
        const response = await request(app).get("/api/auth/me");

        assert.equal(response.status, 401);
        assert.equal(response.body.success, false);
    });

    //Logout Tests 
    it("should logout successfully and clear the access token cookie", async () => {
        const agent = request.agent(app);

        // Login first
        await agent
            .post("/api/auth/login")
            .send({
                email: loginTestEmail,
                password: loginTestPassword,
            });

        // Logout
        const response = await agent.post("/api/auth/logout");

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.equal(response.body.message, "Logout successful.");

        const cookies = response.headers["set-cookie"];
        assert.ok(cookies);

        const accessTokenCookie = cookies.find((cookie) =>
            cookie.startsWith("accessToken=")
        );
        assert.ok(accessTokenCookie);
        assert.match(accessTokenCookie, /Expires=/i);
    });
});
