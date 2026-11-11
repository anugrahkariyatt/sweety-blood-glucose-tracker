
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

describe("Health Check API", () => {
  it("should return 200 when the API is running", async () => {
    const response = await request(app).get("/");

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(
      response.body.message,
      "Sweety API is running!"
    );
  });
});
