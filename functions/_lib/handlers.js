import { getDb } from "./mongodb.js";

// Images are saved to public/uploads/ first (see api/admin/upload-image.js);
// content endpoints only ever receive and store the resulting /uploads/...
// URL, never raw image bytes. This just sanity-checks that shape — a stray
// oversized data: URL would bloat the document and blow past the request
// body limit.
const MAX_IMAGE_VALUE_LENGTH = 2000;

export function checkImageValue(value) {
  const str = String(value || "");
  if (!str) return "";
  if (str.length > MAX_IMAGE_VALUE_LENGTH) {
    throw new Error("Image reference is too long — upload the image first, then save its URL");
  }
  return str;
}

// Factory for endpoints that expose a single content document (site
// settings, homepage copy, about copy) stored as one document in its
// collection.
export function singletonHandler(collectionName) {
  return async function handler(req, res) {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "Method not allowed" });
    }
    try {
      const db = await getDb();
      const doc = await db.collection(collectionName).findOne({}, { projection: { _id: 0 } });
      return res.status(200).json(doc || {});
    } catch (err) {
      console.error(`Failed to load ${collectionName}:`, err);
      return res.status(500).json({ error: "Failed to load content" });
    }
  };
}

// Factory for endpoints that expose every document in a collection
// (services, products, team, testimonials).
export function listHandler(collectionName) {
  return async function handler(req, res) {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "Method not allowed" });
    }
    try {
      const db = await getDb();
      const docs = await db
        .collection(collectionName)
        .find({})
        .toArray();
      return res.status(200).json(docs);
    } catch (err) {
      console.error(`Failed to load ${collectionName}:`, err);
      return res.status(500).json({ error: "Failed to load content" });
    }
  };
}
