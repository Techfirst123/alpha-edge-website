import { getDb } from "../../_lib/mongodb.js";
import { requireAdmin } from "../../_lib/auth.js";
import { checkImageValue } from "../../_lib/handlers.js";
import { toPages } from "../../_lib/adapter.js";

// Updates exactly one Expertise card's image (by index 0-5). Title, text
// and icon are fixed in Expertise.jsx and cannot be changed here.


const handler = requireAdmin(async (req, res) => {
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { index, image } = req.body || {};
  if (!Number.isInteger(index) || index < 0 || index > 5) {
    return res.status(400).json({ error: "index must be an integer 0-5" });
  }

  let safeImage;
  try {
    safeImage = checkImageValue(image);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  if (!safeImage) {
    return res.status(400).json({ error: "image is required" });
  }

  try {
    const db = await getDb();
    await db
      .collection("expertiseTiles")
      .updateOne(
        {},
        { $set: { [`images.${index}`]: safeImage, updatedBy: req.admin.id, updatedAt: new Date() } },
        { upsert: true }
      );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to update expertise tile image:", err);
    return res.status(500).json({ error: "Failed to save image" });
  }
});

export const onRequest = toPages(handler);
