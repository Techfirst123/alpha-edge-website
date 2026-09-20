import { getDb } from "../_lib/mongodb.js";
import { toPages } from "../_lib/adapter.js";

// Aggregate stats for the home page rating card — computed straight from
// the ratings in the `testimonials` collection (see api/ratings.js), never
// hardcoded, so it always reflects what's actually been submitted.


async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await getDb();
    const docs = await db
      .collection("testimonials")
      .find({}, { projection: { rating: 1 } })
      .toArray();

    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    let total = 0;

    for (const doc of docs) {
      const r = Number(doc.rating);
      if (Number.isInteger(r) && r >= 1 && r <= 5) {
        counts[r] += 1;
        sum += r;
        total += 1;
      }
    }

    const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    return res.status(200).json({ average, total, counts });
  } catch (err) {
    console.error("Failed to load ratings summary:", err);
    return res.status(500).json({ error: "Failed to load ratings summary" });
  }
}

export const onRequest = toPages(handler);
