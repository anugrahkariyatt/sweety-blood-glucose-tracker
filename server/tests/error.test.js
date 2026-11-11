
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import AppError from "../src/utils/AppError.js";
import errorMiddleware from "../src/middleware/error.middleware.js";

// Create a separate Express app for testing errors
const testApp = express();

testApp.get("/operational-error", (req, res, next) => {
  next(new AppError("User not found", 404));
});

testApp.get("/unexpected-error", (req, res, next) => {
  next(new Error("Database connection failed"));
});

testApp.use(errorMiddleware);

describe("Global Error Handler", () => {
  it("should handle operational errors", async () => {
    const response = await request(testApp)
      .get("/operational-error");

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
    assert.equal(response.body.message, "User not found");
  });

  it("should handle unexpected errors", async () => {
    const response = await request(testApp)
      .get("/unexpected-error");

    assert.equal(response.status, 500);
    assert.equal(response.body.success, false);
    assert.equal(
      response.body.message,
      "Something went wrong. Please try again later."
    );
  });
});
