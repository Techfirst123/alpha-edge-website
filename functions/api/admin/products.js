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
};

const MAX_FEATURED_PRODUCTS = 10;

// Admin edit/delete for a single product (by app-level `id`, not Mongo
// `_id` — matches the id already assigned by the Excel importer). `category`
// (the filter key) is intentionally not editable here — changing it would
// silently move a product out of every existing category filter/icon
// mapping on the Products page.


const handler = requireAdmin(async (req, res) => {
  const db = await getDb();
  const products = db.collection("products");

  if (req.method === "PUT") {
    const { id, stock, featured, image, ...rest } = req.body || {};
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

  res.setHeader("Allow", "PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
});

export const onRequest = toPages(handler);
