import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  lazyConnect: true,
  enableOfflineQueue: false,
});

redis.on("connect", () => {
  console.log("Redis connected successfully.");
});

redis.on("error", () => {
});

export const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setCache = async (key, value, ttl = 3600) => {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
  }
};

export const invalidateUserReportCache = async (userId) => {
  try {
    const keys = await redis.keys(`reports:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
  }
};

export default redis;
