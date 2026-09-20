import { getDb } from "../../_lib/mongodb.js";
import { createSessionCookie, verifyPassword, ensureBootstrapSuperAdmin } from "../../_lib/auth.js";
import { getClientIp, checkLoginRateLimit, recordLoginFailure, resetLoginAttempts } from "../../_lib/rateLimit.js";
import { toPages } from "../../_lib/adapter.js";


async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.ADMIN_SESSION_SECRET) {
    return res.status(500).json({ error: "Admin login not configured" });
  }

  const ip = getClientIp(req);
  const rate = await checkLoginRateLimit(ip);
  if (!rate.allowed) {
    return res.status(429).json({
      error: `Too many attempts. Try again in ${Math.ceil(rate.retryAfterSeconds / 60)} minute(s).`,
    });
  }

  const { email, password } = req.body || {};
  const cleanEmail = String(email || "").trim().toLowerCase();

  try {
    const db = await getDb();
    await ensureBootstrapSuperAdmin(db);

    const admin = cleanEmail ? await db.collection("admins").findOne({ email: cleanEmail }) : null;
    const passOk = admin && verifyPassword(password, admin.passwordHash);

    if (!admin || !passOk) {
      await recordLoginFailure(ip);
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    await resetLoginAttempts(ip);
    res.setHeader("Set-Cookie", createSessionCookie(admin.id));
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Admin login failed:", err);
    return res.status(500).json({ error: "Login failed — please try again" });
  }
}

export const onRequest = toPages(handler);
