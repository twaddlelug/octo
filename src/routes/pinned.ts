import { Hono } from "hono";
import { cache } from "../middleware/cache";
import { TTL, getPinned } from "../services/pinned";

const route = new Hono<{ Bindings: CloudflareBindings }>();

route.get("/:username", cache({ ttl: TTL.TWO_HOURS }), async (c) => {
  const data = await getPinned(c.req.param("username"));

  return c.json(data);
});

export default route;
