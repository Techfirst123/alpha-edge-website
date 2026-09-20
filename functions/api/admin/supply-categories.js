import { getDb } from "../../_lib/mongodb.js";
import { requireAdmin } from "../../_lib/auth.js";
import { toPages } from "../../_lib/adapter.js";

// Replaces the full "What We Supply" list — text only (label + short sub
// text). No icon/image/color field exists here: icons are assigned by
// rotation in the frontend, not chosen per item.


const handler = requireAdmin(async (req, res) => {
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const raw = Array.isArray(req.body?.categories) ? req.body.categories : null;
  if (!raw) {
    return res.status(400).json({ error: "categories must be an array" });
  }

  const categories = raw
    .map((c) => ({
      label: String(c?.label || "").trim().slice(0, 60),
      sub: String(c?.sub || "").trim().slice(0, 120),
    }))
    .filter((c) => c.label);

  try {
    const db = await getDb();
    await db
      .collection("supplyCategories")
      .updateOne(
        {},
        { $set: { categories, updatedBy: req.admin.id, updatedAt: new Date() } },
        { upsert: true }
      );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to update supply categories:", err);
    return res.status(500).json({ error: "Failed to save list" });
  }
});

export const onRequest = toPages(handler);
