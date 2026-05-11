import { Hono } from "hono";
import { cache } from "../middleware/cache";
import {
  TTL,
  getContributions,
  isPastYear,
  parseYearParam,
} from "../services/contributions";

const route = new Hono<{ Bindings: CloudflareBindings }>();

route.get(
  "/:username",
  async (c, next) => {
    const year = parseYearParam(c.req.query("y"));
    const ttl = isPastYear(year) ? TTL.SIX_HOURS : TTL.ONE_HOUR;

    return cache({ ttl })(c, next);
  },
  async (c) => {
    const year = parseYearParam(c.req.query("y"));
    const data = await getContributions(c.req.param("username"), year);

    return c.json(data);
  },
);

export default route;
