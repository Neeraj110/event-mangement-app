import Redis from "ioredis";

let redis: Redis | null = null;

export const connectRedis = (): Redis => {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 2000);
      console.log(
        `🔄 Redis reconnecting... attempt ${times} (delay ${delay}ms)`,
      );
      return delay;
    },
    reconnectOnError(err) {
      const targetErrors = ["READONLY", "ECONNRESET", "ECONNREFUSED"];
      return targetErrors.some((e) => err.message.includes(e));
    },
  });

  redis.on("connect", () => {
    console.log("✅ Redis connected successfully");
  });

  redis.on("error", (err) => {
    console.error("❌ Redis connection error:", err.message);
  });

  redis.on("close", () => {
    console.log("⚠️ Redis connection closed");
  });

  return redis;
};

export const getRedis = (): Redis => {
  if (!redis) {
    throw new Error("Redis not initialized. Call connectRedis() first.");
  }
  return redis;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("🔌 Redis disconnected");
  }
};

export default { connectRedis, getRedis, disconnectRedis };
