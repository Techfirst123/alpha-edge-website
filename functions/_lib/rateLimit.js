import { getDb } from "./mongodb.js";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

// Blocks further login attempts from an IP after MAX_ATTEMPTS failures
// inside WINDOW_MS — makes brute-forcing the admin password impractical.
export async function checkLoginRateLimit(ip) {
  const db = await getDb();
  const doc = await db.collection("loginAttempts").findOne({ ip });
  if (!doc) return { allowed: true };

  const withinWindow = Date.now() - doc.firstAttempt < WINDOW_MS;
  if (withinWindow && doc.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (Date.now() - doc.firstAttempt)) / 1000);
    return { allowed: false, retryAfterSeconds };
  }
  return { allowed: true };
}

export async function recordLoginFailure(ip) {
  const db = await getDb();
  const now = Date.now();
  const doc = await db.collection("loginAttempts").findOne({ ip });

  if (!doc || now - doc.firstAttempt > WINDOW_MS) {
    await db
      .collection("loginAttempts")
      .updateOne({ ip }, { $set: { ip, firstAttempt: now, count: 1, lastAttempt: now } }, { upsert: true });
  } else {
    await db
      .collection("loginAttempts")
      .updateOne({ ip }, { $inc: { count: 1 }, $set: { lastAttempt: now } });
  }
}

export async function resetLoginAttempts(ip) {
  const db = await getDb();
  await db.collection("loginAttempts").deleteOne({ ip });
}
