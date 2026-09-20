import crypto from "node:crypto";
import { getDb } from "./mongodb.js";

const COOKIE_NAME = "admin_session";
// Short, sliding session: every authenticated request re-issues the cookie
// for another MAX_AGE_SECONDS (see requireAdmin/me.js). So an admin actively
// using the panel stays logged in, but closing the tab/going idle for more
// than this expires the session — the browser stops sending an expired
// cookie, and the signed expiry is double-checked anyway.
const MAX_AGE_SECONDS = 10 * 60; // 10 minutes
const SCRYPT_KEYLEN = 64;

function sign(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function cookieFlags() {
  // Cloudflare has no VERCEL_ENV equivalent. Secure-by-default: only skip
  // the Secure flag when explicitly running local dev (`wrangler pages dev`
  // over plain http://localhost, where a Secure cookie would never be sent
  // back by the browser). Set ENVIRONMENT=development in .dev.vars for
  // local dev; leave it unset (or "production") everywhere else.
  const isDev = process.env.ENVIRONMENT === "development";
  return `HttpOnly; SameSite=Lax; Path=/${isDev ? "" : "; Secure"}`;
}

// Session cookie only ever carries the admin's numeric `id` (never their
// role) — role is re-read from the `admins` collection on every request (see
// getSessionAdmin below), so a role change or account deletion takes effect
// immediately instead of waiting out a stale, self-contained token.
export function createSessionCookie(adminId) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  const payload = Buffer.from(
    JSON.stringify({ adminId, exp: Date.now() + MAX_AGE_SECONDS * 1000 })
  ).toString("base64url");
  const token = `${payload}.${sign(payload, secret)}`;
  return `${COOKIE_NAME}=${token}; ${cookieFlags()}; Max-Age=${MAX_AGE_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; ${cookieFlags()}; Max-Age=0`;
}

function parseCookies(header) {
  const out = {};
  (header || "").split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
  });
  return out;
}

function verifySessionToken(req) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;

  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!token) return null;

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = sign(payload, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.exp !== "number" || Date.now() >= data.exp) return null;
    if (!Number.isFinite(Number(data.adminId))) return null;
    return data;
  } catch {
    return null;
  }
}

// Salted scrypt password hashing via Node's built-in crypto — no extra
// dependency needed for this (the project already leans on `crypto` for the
// session HMAC above). Stored as "saltHex:hashHex".
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  let hashBuffer;
  try {
    hashBuffer = Buffer.from(hash, "hex");
  } catch {
    return false;
  }
  const candidate = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN);
  if (candidate.length !== hashBuffer.length) return false;
  return crypto.timingSafeEqual(candidate, hashBuffer);
}

// One-time, idempotent migration: the very first admin this project ever
// had was a single email/password pair in .env (no `admins` collection at
// all). The first time anyone logs in against an empty `admins` collection,
// that env-based account is seeded in as the initial Super Admin — so the
// existing deployment keeps working with zero manual migration steps.
export async function ensureBootstrapSuperAdmin(db) {
  const admins = db.collection("admins");
  const count = await admins.countDocuments();
  if (count > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  await admins.insertOne({
    id: 1,
    name: "Super Admin",
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    role: "superadmin",
    createdAt: new Date(),
    createdBy: null,
  });
}

// Looks up the live admin record for the current session — never trusts a
// role baked into the cookie itself, so a deletion or role change made by a
// Super Admin takes effect on that admin's very next request.
export async function getSessionAdmin(req) {
  const session = verifySessionToken(req);
  if (!session) return null;

  const db = await getDb();
  const admin = await db.collection("admins").findOne({ id: session.adminId });
  if (!admin) return null;

  return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
}

export function requireAdmin(handler) {
  return async (req, res) => {
    const admin = await getSessionAdmin(req);
    if (!admin) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.admin = admin;
    // Slide the session forward — being active keeps the admin logged in.
    res.setHeader("Set-Cookie", createSessionCookie(admin.id));
    return handler(req, res);
  };
}

export function requireSuperAdmin(handler) {
  return requireAdmin(async (req, res) => {
    if (req.admin.role !== "superadmin") {
      return res.status(403).json({ error: "Super Admin access required" });
    }
    return handler(req, res);
  });
}
