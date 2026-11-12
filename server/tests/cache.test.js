import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import redis, { getCache, setCache, invalidateUserReportCache } from "../src/config/redis.js";

describe("Redis Cache & Invalidation Helper", () => {
    after(() => {
        redis.disconnect();
    });

    it("should handle getCache gracefully without crashing when key is absent or offline", async () => {
        const result = await getCache("non_existent_key_123");
        assert.equal(result, null);
    });

    it("should handle setCache and invalidateUserReportCache gracefully without throwing", async () => {
        await assert.doesNotReject(async () => {
            await setCache("reports:test_user:daily:2026-11-12", { average: 120 });
            await invalidateUserReportCache("test_user");
        });
    });
});
