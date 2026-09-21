import { getDb } from "../../_lib/mongodb.js";
import { requireAdmin } from "../../_lib/auth.js";
import { checkImageValue } from "../../_lib/handlers.js";
import { toPages } from "../../_lib/adapter.js";

const EDITABLE_TEXT_FIELDS = {
  category_label: 80,
  brand: 80,
  name: 160,
  model: 80,
  short_description: 300,
  lead_time: 40,
  // Shown on the product card: comma-separated spec chips ("48, UPOE") and a
  // short warranty line ("Warranty included"). Both are optional — a product
  // with neither simply renders without them.
  specs: 120,
  warranty: 80,
};

// Condition badge on the card. Anything outside this list is stored as "",
// which hides the badge rather than guessing New or Refurbished.
const CONDITION_VALUES = new Set(["new", "refurb"]);

const MAX_FEATURED_PRODUCTS = 10;

// Category keys the public Products page filters on (see
// src/data/placeholder.js placeholderProductCategories).
const CATEGORY_LABELS = {
  switch: "Network Switches",
  router: "Routers & Firewalls",
  server: "Servers & Compute",
  storage: "Storage · NAS & SAN",
  hub: "Hubs & Media Converters",
  optic: "Optics, Cabling & Power",
};

// Admin edit/delete for a single product (by app-level `id`, not Mongo
// `_id` — matches the id already assigned by the Excel importer). `category`
// (the filter key) is intentionally not editable here — changing it would
// silently move a product out of every existing category filter/icon
// mapping on the Products page.


const handler = requireAdmin(async (req, res) => {
  const db = await getDb();
  const products = db.collection("products");

  if (req.method === "PUT") {
    const { id, stock, featured, image, condition, ...rest } = req.body || {};
    const productId = Number(id);
    if (!Number.isFinite(productId)) {
      return res.status(400).json({ error: "A valid product id is required" });
    }

    const update = {};
    for (const [field, maxLength] of Object.entries(EDITABLE_TEXT_FIELDS)) {
      if (rest[field] !== undefined) {
        update[field] = String(rest[field] || "").trim().slice(0, maxLength);
      }
    }
    if (stock !== undefined) {
      update.stock = stock === "order" ? "order" : "in";
    }
    if (condition !== undefined) {
      update.condition = CONDITION_VALUES.has(condition) ? condition : "";
    }
    if (featured !== undefined) {
      update.featured = Boolean(featured);
    }
    if (image !== undefined) {
      try {
        update.image = checkImageValue(image);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No editable fields provided" });
    }

    try {
      const existing = await products.findOne({ id: productId }, { projection: { featured: 1 } });
      if (!existing) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Only gate *newly* turning a product's Top 10 flag on — leaving an
      // already-featured product's other fields alone (or turning it off)
      // never needs this check.
      if (update.featured === true && !existing.featured) {
        const featuredCount = await products.countDocuments({ featured: true });
        if (featuredCount >= MAX_FEATURED_PRODUCTS) {
          return res.status(400).json({
            error: `Maximum ${MAX_FEATURED_PRODUCTS} products can be shown in the homepage Top 10 — remove one first.`,
          });
        }
      }

      update.updatedBy = req.admin.id;
      update.updatedAt = new Date();

      const result = await products.updateOne({ id: productId }, { $set: update });
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Failed to update product:", err);
      return res.status(500).json({ error: "Failed to save product" });
    }
  }

  // Add a single product by hand (the Excel import is for bulk). `category`
  // must be one of the site's category keys so it lands in the right filter.
  if (req.method === "POST") {
    const body = req.body || {};
    const category = String(body.category || "");
    if (!CATEGORY_LABELS[category]) {
      return res.status(400).json({ error: "Choose a valid category" });
    }
    const doc = { category, category_label: CATEGORY_LABELS[category] };
    for (const [field, maxLength] of Object.entries(EDITABLE_TEXT_FIELDS)) {
      if (body[field] !== undefined) doc[field] = String(body[field] || "").trim().slice(0, maxLength);
    }
    if (!doc.name) return res.status(400).json({ error: "Product name is required" });
    if (body.category_label) doc.category_label = String(body.category_label).trim().slice(0, 80);
    doc.stock = body.stock === "order" ? "order" : "in";
    doc.condition = CONDITION_VALUES.has(body.condition) ? body.condition : "";
    doc.featured = false;
    try {
      doc.image = checkImageValue(body.image);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const last = await products.find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
      doc.id = (Number(last[0]?.id) || 0) + 1;
      doc.createdAt = new Date();
      doc.updatedBy = req.admin.id;
      await products.insertOne(doc);
      const { _id, ...created } = doc;
      return res.status(201).json(created);
    } catch (err) {
      console.error("Failed to create product:", err);
      return res.status(500).json({ error: "Failed to create product" });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    const productId = Number(id);
    if (!Number.isFinite(productId)) {
      return res.status(400).json({ error: "A valid product id is required" });
    }

    try {
      const result = await products.deleteOne({ id: productId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Failed to delete product:", err);
      return res.status(500).json({ error: "Failed to delete product" });
    }
  }

  res.setHeader("Allow", "POST, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
});

export const onRequest = toPages(handler);
