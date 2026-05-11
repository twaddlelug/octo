import { env } from "cloudflare:workers";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

type RateLimitOptions = {
  getRateLimitKey: (c: Context) => string;
};

const rateLimit = ({ getRateLimitKey }: RateLimitOptions) =>
  createMiddleware(async (c, next) => {
    const key = getRateLimitKey(c);
    if (!key) {
      throw new HTTPException(400, { message: "Missing rate limit key" });
    }

    const { success } = await env.RATE_LIMITER.limit({ key });
    if (!success) {
      throw new HTTPException(429, { message: "Too many requests" });
    }

    await next();
  });

export { rateLimit };
