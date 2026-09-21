import { getDb } from "../../_lib/mongodb.js";
import { requireAdmin } from "../../_lib/auth.js";
import { toPages } from "../../_lib/adapter.js";

// Admin view of every submitted rating/feedback, plus the same summary
// shown publicly — powers the Dashboard "Ratings & Feedback" section in one
// call (table rows + the star-count/average cards above it).


const handler = requireAdmin(async (req, res) => {
  // Remove a review (spam, test entries) — DELETE { id }.
  if (req.method === "DELETE") {
    const id = Number(req.body?.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "A valid review id is required" });
    try {
      const db = await getDb();
      const result = await db.collection("testimonials").deleteOne({ id });
      if (result.deletedCount === 0) return res.status(404).json({ error: "Review not found" });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Failed to delete review:", err);
      return res.status(500).json({ error: "Failed to delete review" });
    }
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await getDb();
    const docs = await db.collection("testimonials").find({}).sort({ createdAt: -1 }).toArray();

    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    let total = 0;

    const reviews = docs.map((doc) => {
      const rating = Number(doc.rating) || 0;
      if (rating >= 1 && rating <= 5) {
        counts[rating] += 1;
        sum += rating;
        total += 1;
      }
      return {
        id: doc.id,
        name: doc.name || doc.client_name || "Anonymous",
        rating,
        feedback: doc.feedback || doc.quote || "",
        createdAt: doc.createdAt || null,
      };
    });

    const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    return res.status(200).json({ reviews, summary: { average, total, counts } });
  } catch (err) {
    console.error("Failed to load admin ratings:", err);
    return res.status(500).json({ error: "Failed to load ratings" });
  }
});

export const onRequest = toPages(handler);
