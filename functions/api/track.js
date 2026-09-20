import { getDb } from "../_lib/mongodb.js";
import { toPages } from "../_lib/adapter.js";

// Public endpoint — records anonymous visit activity for the admin-only
// /details analytics page. The frontend only calls this after the visitor
// has accepted cookies (see src/hooks/useVisitorTracking.js); no personal
// identity is captured, just a random per-browser id.


async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, sessionId, visitorId, path, referrer } = req.body || {};
  if (!sessionId || !type) {
    return res.status(400).json({ error: "sessionId and type are required" });
  }

  const userAgent = String(req.headers["user-agent"] || "").slice(0, 300);

  try {
    const db = await getDb();

    if (type === "pageview") {
      await db.collection("pageEvents").insertOne({
        sessionId: String(sessionId).slice(0, 100),
        visitorId: String(visitorId || "").slice(0, 100),
        path: String(path || "/").slice(0, 300),
        referrer: String(referrer || "").slice(0, 300),
        userAgent,
        timestamp: new Date(),
      });
    } else if (type === "heartbeat") {
      await db.collection("heartbeats").insertOne({
        sessionId: String(sessionId).slice(0, 100),
        path: String(path || "/").slice(0, 300),
        timestamp: new Date(),
      });
    } else {
      return res.status(400).json({ error: "Unknown event type" });
    }

    return res.status(204).end();
  } catch (err) {
    console.error("Failed to record tracking event:", err);
    return res.status(500).json({ error: "Failed to record event" });
  }
}

export const onRequest = toPages(handler);
