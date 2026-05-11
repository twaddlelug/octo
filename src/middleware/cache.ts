import { createMiddleware } from "hono/factory";

type CacheOptions = {
  ttl: number;
};

const cache = ({ ttl }: CacheOptions) =>
  createMiddleware(async (c, next) => {
    const store = caches.default;
    const cacheKey = new Request(c.req.url, { method: "GET" });
    const cached = await store.match(cacheKey);

    if (cached) {
      return new Response(cached.body, cached);
    }

    await next();

    if (c.res.ok) {
      const cachedResponse = new Response(c.res.clone().body, c.res);
      cachedResponse.headers.set("Cache-Control", `public, max-age=${ttl}`);

      c.executionCtx.waitUntil(store.put(cacheKey, cachedResponse));
    }
  });

export { cache };
