import { ObjectId } from "mongodb";
import { getDb } from "../../_lib/mongodb.js";
import { requireAdmin } from "../../_lib/auth.js";
import { toPages } from "../../_lib/adapter.js";

// Enquiries submitted through the Contact and Get a Quote forms.
//   GET    -> newest first
//   PUT    { id, status: "new" | "read" | "done" }
//   DELETE { id }
const STATUSES = new Set(["new", "read", "done"]);

function toObjectId(id) {
  try {
    return new ObjectId(String(id));
  } catch {
    return null;
  }
}

const handler = requireAdmin(async (req, res) => {
  const db = await getDb();
  const leads = db.collection("leads");

  try {
    if (req.method === "GET") {
      const docs = await leads.find({}).sort({ created_at: -1 }).limit(500).toArray();
      return res.status(200).json(
        docs.map(({ _id, ...doc }) => ({ ...doc, id: String(_id), status: doc.status || "new" }))
      );
    }

    if (req.method === "PUT") {
      const _id = toObjectId(req.body?.id);
      const status = req.body?.status;
      if (!_id) return res.status(400).json({ error: "A valid id is required" });
      if (!STATUSES.has(status)) return res.status(400).json({ error: "Invalid status" });
      const result = await leads.updateOne({ _id }, { $set: { status, updatedBy: req.admin.id, updatedAt: new Date() } });
      if (result.matchedCount === 0) return res.status(404).json({ error: "Enquiry not found" });
      return res.status(200).json({ success: true });
    }

    if (req.method === "DELETE") {
      const _id = toObjectId(req.body?.id);
      if (!_id) return res.status(400).json({ error: "A valid id is required" });
      const result = await leads.deleteOne({ _id });
      if (result.deletedCount === 0) return res.status(404).json({ error: "Enquiry not found" });
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", "GET, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Admin leads request failed:", err);
    return res.status(500).json({ error: "Failed to load enquiries" });
  }
});

export const onRequest = toPages(handler);
