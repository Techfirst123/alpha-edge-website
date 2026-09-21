import { getDb } from "../../_lib/mongodb.js";
import { requireAdmin } from "../../_lib/auth.js";
import { toPages } from "../../_lib/adapter.js";
import { SINGLETON_SCHEMAS, sanitize } from "../../_lib/contentSchemas.js";

// Admin panel editor for the single-document content sections:
//   GET  /api/admin/content?section=siteSettings
//   PUT  /api/admin/content  { section, values: { ...fields } }
// `section` must be one of SINGLETON_SCHEMAS; only whitelisted fields are
// saved. The public GET endpoints (/api/site-settings etc.) read the same
// documents, so a save here shows up on the website straight away.
const handler = requireAdmin(async (req, res) => {
  const section = req.method === "GET" ? req.query?.section : req.body?.section;
  const schema = SINGLETON_SCHEMAS[section];
  if (!schema) {
    return res.status(400).json({ error: "Unknown section" });
  }

  const db = await getDb();
  const collection = db.collection(section);

  if (req.method === "GET") {
    try {
      const doc = await collection.findOne({}, { projection: { _id: 0 } });
      return res.status(200).json(doc || {});
    } catch (err) {
      console.error(`Failed to load ${section}:`, err);
      return res.status(500).json({ error: "Failed to load content" });
    }
  }

  if (req.method === "PUT") {
    const values = sanitize(schema, req.body?.values || {});
    if (Object.keys(values).length === 0) {
      return res.status(400).json({ error: "No editable fields provided" });
    }
    try {
      await collection.updateOne(
        {},
        { $set: { ...values, updatedBy: req.admin.id, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(`Failed to save ${section}:`, err);
      return res.status(500).json({ error: "Failed to save content" });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "Method not allowed" });
});

export const onRequest = toPages(handler);
