import { getDb } from "../../_lib/mongodb.js";
import { requireAdmin } from "../../_lib/auth.js";
import { toPages } from "../../_lib/adapter.js";

// Powers the Dashboard "Product Overview" cards — total products, and the
// actual distinct categories/brands present in the catalog right now (never
// hardcoded, so adding/removing products keeps this in sync automatically).


const handler = requireAdmin(async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await getDb();
    const products = db.collection("products");

    const [totalProducts, categoryGroups, brandGroups] = await Promise.all([
      products.countDocuments(),
      products
        .aggregate([
          {
            $group: {
              _id: "$category",
              label: { $first: "$category_label" },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      products
        .aggregate([
          { $match: { brand: { $nin: [null, ""] } } },
          { $group: { _id: "$brand" } },
          { $sort: { _id: 1 } },
        ])
        .toArray(),
    ]);

    return res.status(200).json({
      totalProducts,
      categories: categoryGroups
        .filter((c) => c._id)
        .map((c) => ({ key: c._id, label: c.label || c._id, count: c.count })),
      brands: brandGroups.map((b) => b._id),
    });
  } catch (err) {
    console.error("Failed to load product stats:", err);
    return res.status(500).json({ error: "Failed to load product stats" });
  }
});

export const onRequest = toPages(handler);
