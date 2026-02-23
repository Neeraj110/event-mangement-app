import { getRedis } from "../config/redis";

/**
 * Get a cached value by key. Returns null on miss.
 */
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await getRedis().get(key);
    if (!data) return null;
    console.log(`🟢 Cache HIT: ${key}`);
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Cache GET error for key ${key}:`, err);
    return null;
  }
};

/**
 * Set a value in cache with TTL (in seconds).
 */
export const cacheSet = async (
  key: string,
  data: unknown,
  ttlSeconds: number = 60,
): Promise<void> => {
  try {
    await getRedis().setex(key, ttlSeconds, JSON.stringify(data));
    console.log(`🔵 Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (err) {
    console.error(`Cache SET error for key ${key}:`, err);
  }
};

/**
 * Delete a specific cache key.
 */
export const cacheDelete = async (key: string): Promise<void> => {
  try {
    await getRedis().del(key);
    console.log(`🔴 Cache DELETE: ${key}`);
  } catch (err) {
    console.error(`Cache DELETE error for key ${key}:`, err);
  }
};

/**
 * Delete all keys matching a glob pattern.
 * Uses SCAN to avoid blocking Redis on large keyspaces.
 */
export const cacheDeletePattern = async (pattern: string): Promise<void> => {
  try {
    const redis = getRedis();
    let cursor = "0";
    let totalDeleted = 0;

    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(...keys);
        totalDeleted += keys.length;
      }
    } while (cursor !== "0");

    if (totalDeleted > 0) {
      console.log(`🔴 Cache DELETE PATTERN: ${pattern} (${totalDeleted} keys)`);
    }
  } catch (err) {
    console.error(`Cache DELETE PATTERN error for ${pattern}:`, err);
  }
};
