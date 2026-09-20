import { getDb } from "../../_lib/mongodb.js";
import { requireSuperAdmin, hashPassword } from "../../_lib/auth.js";
import { toPages } from "../../_lib/adapter.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = new Set(["admin", "superadmin"]);
const MIN_PASSWORD_LENGTH = 8;

function toPublicAdmin(doc) {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    createdAt: doc.createdAt || null,
  };
}

// Admin Management — every operation here is Super Admin only. Creating,
// deleting and role-changing all guard against ever leaving the system with
// zero Super Admins, so nobody can lock themselves (or everyone else) out.


const handler = requireSuperAdmin(async (req, res) => {
  const db = await getDb();
  const admins = db.collection("admins");

  if (req.method === "GET") {
    try {
      const docs = await admins.find({}).sort({ createdAt: 1 }).toArray();
      return res.status(200).json(docs.map(toPublicAdmin));
    } catch (err) {
      console.error("Failed to load admins:", err);
      return res.status(500).json({ error: "Failed to load admins" });
    }
  }

  if (req.method === "POST") {
    const { name, email, password, role } = req.body || {};
    const cleanName = String(name || "").trim().slice(0, 80);
    const cleanEmail = String(email || "").trim().toLowerCase().slice(0, 200);
    const cleanRole = VALID_ROLES.has(role) ? role : "admin";

    if (!cleanName) return res.status(400).json({ error: "Name is required" });
    if (!EMAIL_RE.test(cleanEmail)) return res.status(400).json({ error: "A valid email is required" });
    if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    try {
      const existing = await admins.findOne({ email: cleanEmail });
      if (existing) return res.status(409).json({ error: "An admin with this email already exists" });

      const existingMax = await admins.find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
      const id = (existingMax[0]?.id || 0) + 1;

      const doc = {
        id,
        name: cleanName,
        email: cleanEmail,
        passwordHash: hashPassword(password),
        role: cleanRole,
        createdAt: new Date(),
        createdBy: req.admin.id,
      };
      await admins.insertOne(doc);
      return res.status(201).json(toPublicAdmin(doc));
    } catch (err) {
      console.error("Failed to create admin:", err);
      return res.status(500).json({ error: "Failed to create admin" });
    }
  }

  if (req.method === "PUT") {
    const { id, role } = req.body || {};
    const adminId = Number(id);
    if (!Number.isFinite(adminId)) return res.status(400).json({ error: "A valid admin id is required" });
    if (!VALID_ROLES.has(role)) return res.status(400).json({ error: "Role must be admin or superadmin" });

    try {
      const target = await admins.findOne({ id: adminId });
      if (!target) return res.status(404).json({ error: "Admin not found" });

      if (target.role === "superadmin" && role !== "superadmin") {
        const superadminCount = await admins.countDocuments({ role: "superadmin" });
        if (superadminCount <= 1) {
          return res.status(400).json({ error: "At least one Super Admin must remain — promote another admin first" });
        }
      }

      await admins.updateOne({ id: adminId }, { $set: { role } });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Failed to update admin role:", err);
      return res.status(500).json({ error: "Failed to update admin role" });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    const adminId = Number(id);
    if (!Number.isFinite(adminId)) return res.status(400).json({ error: "A valid admin id is required" });

    if (adminId === req.admin.id) {
      return res.status(400).json({ error: "You cannot delete your own account — ask another Super Admin" });
    }

    try {
      const target = await admins.findOne({ id: adminId });
      if (!target) return res.status(404).json({ error: "Admin not found" });

      if (target.role === "superadmin") {
        const superadminCount = await admins.countDocuments({ role: "superadmin" });
        if (superadminCount <= 1) {
          return res.status(400).json({ error: "At least one Super Admin must remain and cannot be deleted" });
        }
      }

      await admins.deleteOne({ id: adminId });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Failed to delete admin:", err);
      return res.status(500).json({ error: "Failed to delete admin" });
    }
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
});

export const onRequest = toPages(handler);
