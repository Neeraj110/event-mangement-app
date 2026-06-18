import { getRedis } from "../config/redis";
import { Request, Response, NextFunction } from "express";

export const rateLimiter = (
  limit: number,
  windowMs: number,
  customMessage?: string,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redis = getRedis();
      const key = `rate_limit:${req.originalUrl}:${req.ip}`;

      const count = await redis.incr(key);

      if (count === 1) {
        await redis.pexpire(key, windowMs);
      }

      if (count > limit) {
        const ttl = await redis.pttl(key);
        res.status(429).json({
          message: customMessage || "Too many requests",
          retryAfter: Math.ceil(ttl / 1000),
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Redis rate limiter error:", error);
      next();
    }
  };
};
