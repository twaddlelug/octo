import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { rateLimit } from "./middleware/rate-limit";
import contributions from "./routes/contributions";
import pinned from "./routes/pinned";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(cors({ origin: "*", allowMethods: ["GET"] }));

app.use(
  rateLimit({
    getRateLimitKey: (c) => c.req.header("CF-Connecting-IP") ?? "anonymous",
  }),
);

app.route("/contributions", contributions);
app.route("/pinned", pinned);

app.notFound((c) => c.json({ error: "not found" }, 404));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(
    JSON.stringify({
      message: "unhandled error",
      error: err instanceof Error ? err.message : String(err),
      path: new URL(c.req.url).pathname,
    }),
  );
  return c.json({ error: "internal server error" }, 500);
});

export default app;
