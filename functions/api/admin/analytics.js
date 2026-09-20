import { getDb } from "../../_lib/mongodb.js";
import { requireAdmin } from "../../_lib/auth.js";
import { toPages } from "../../_lib/adapter.js";

const HEARTBEAT_SECONDS = 15; // must match the client's heartbeat interval


const handler = requireAdmin(async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await getDb();

    const sessions = await db
      .collection("pageEvents")
      .aggregate([
        { $sort: { timestamp: 1 } },
        {
          $group: {
            _id: "$sessionId",
            visitorId: { $first: "$visitorId" },
            referrer: { $first: "$referrer" },
            userAgent: { $first: "$userAgent" },
            firstSeen: { $min: "$timestamp" },
            lastSeen: { $max: "$timestamp" },
            pages: { $push: "$path" },
          },
        },
        { $sort: { lastSeen: -1 } },
        { $limit: 300 },
      ])
      .toArray();

    const heartbeatCounts = await db
      .collection("heartbeats")
      .aggregate([{ $group: { _id: "$sessionId", pings: { $sum: 1 } } }])
      .toArray();
    const pingsBySession = Object.fromEntries(heartbeatCounts.map((h) => [h._id, h.pings]));

    const result = sessions.map((s) => ({
      sessionId: s._id,
      visitorId: s.visitorId,
      referrer: s.referrer || "Direct",
      userAgent: s.userAgent,
      firstSeen: s.firstSeen,
      lastSeen: s.lastSeen,
      pages: [...new Set(s.pages)],
      pageViewCount: s.pages.length,
      secondsOnSite: (pingsBySession[s._id] || 0) * HEARTBEAT_SECONDS,
    }));

    return res.status(200).json({
      sessions: result,
      totals: {
        totalSessions: result.length,
        uniqueVisitors: new Set(result.map((r) => r.visitorId)).size,
      },
    });
  } catch (err) {
    console.error("Failed to load analytics:", err);
    return res.status(500).json({ error: "Failed to load analytics" });
  }
});

export const onRequest = toPages(handler);
