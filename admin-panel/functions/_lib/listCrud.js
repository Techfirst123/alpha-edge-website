import { getDb } from "./mongodb.js";
import { LIST_SCHEMAS, sanitize, slugify } from "./contentSchemas.js";

// Create / update / delete for a list collection (services, team) from the
// admin panel. Items are addressed by their numeric app-level `id`.
//   GET    -> all items, sorted by `order` then id
//   POST   { ...fields }        -> create
//   PUT    { id, ...fields }    -> update
//   DELETE { id }               -> remove
//   PATCH  { ids: [..] }        -> save display order
export function listCrudHandler(collectionName) {
  const schema = LIST_SCHEMAS[collectionName];

  return async function handler(req, res) {
    const db = await getDb();
    const collection = db.collection(collectionName);

    try {
      if (req.method === "GET") {
        const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
        docs.sort((a, b) => (a.order ?? a.id ?? 0) - (b.order ?? b.id ?? 0));
        return res.status(200).json(docs);
      }

      if (req.method === "POST") {
        const values = sanitize(schema.fields, req.body || {}, { partial: false });
        for (const field of schema.required) {
          if (!values[field]) return res.status(400).json({ error: `${field} is required` });
        }
        if ("slug" in values) values.slug = slugify(values.slug || values.title);

        const last = await collection.find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
        const id = (Number(last[0]?.id) || 0) + 1;
        const doc = { id, ...values, order: id, createdAt: new Date(), updatedBy: req.admin.id };
        await collection.insertOne(doc);
        const { _id, ...publicDoc } = doc;
        return res.status(201).json(publicDoc);
      }

      if (req.method === "PUT") {
        const id = Number(req.body?.id);
        if (!Number.isFinite(id)) return res.status(400).json({ error: "A valid id is required" });
        const values = sanitize(schema.fields, req.body || {});
        for (const field of schema.required) {
          if (field in values && !values[field]) return res.status(400).json({ error: `${field} is required` });
        }
        if ("slug" in values) values.slug = slugify(values.slug || values.title);
        if (Object.keys(values).length === 0) return res.status(400).json({ error: "No editable fields provided" });

        const result = await collection.updateOne(
          { id },
          { $set: { ...values, updatedBy: req.admin.id, updatedAt: new Date() } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: "Item not found" });
        return res.status(200).json({ success: true });
      }

      if (req.method === "PATCH") {
        const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number).filter(Number.isFinite) : null;
        if (!ids) return res.status(400).json({ error: "ids must be an array" });
        await Promise.all(ids.map((id, order) => collection.updateOne({ id }, { $set: { order } })));
        return res.status(200).json({ success: true });
      }

      if (req.method === "DELETE") {
        const id = Number(req.body?.id);
        if (!Number.isFinite(id)) return res.status(400).json({ error: "A valid id is required" });
        const result = await collection.deleteOne({ id });
        if (result.deletedCount === 0) return res.status(404).json({ error: "Item not found" });
        return res.status(200).json({ success: true });
      }

      res.setHeader("Allow", "GET, POST, PUT, PATCH, DELETE");
      return res.status(405).json({ error: "Method not allowed" });
    } catch (err) {
      console.error(`Admin ${collectionName} request failed:`, err);
      return res.status(500).json({ error: "Failed to save changes" });
    }
  };
}
