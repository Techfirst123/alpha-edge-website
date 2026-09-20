import { getDb } from "../../_lib/mongodb.js";
import { requireAdmin } from "../../_lib/auth.js";
import { checkImageValue } from "../../_lib/handlers.js";
import { toPages } from "../../_lib/adapter.js";

// Updates exactly one image: either the "apart" section photo, or one of
// the 4 capability tile photos (by index 0-3). Text on this page is fixed
// in WhoWeAre.jsx and cannot be changed through this endpoint.


const handler = requireAdmin(async (req, res) => {
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, index, image } = req.body || {};

  let safeImage;
  try {
    safeImage = checkImageValue(image);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  if (!safeImage) {
    return res.status(400).json({ error: "image is required" });
  }

  let field;
  if (type === "apart") {
    field = "apartImage";
  } else if (type === "capability" && Number.isInteger(index) && index >= 0 && index < 4) {
    field = `capabilityImages.${index}`;
  } else {
    return res.status(400).json({ error: "Invalid target" });
  }

  try {
    const db = await getDb();
    await db
      .collection("whoWeAreImages")
      .updateOne(
        {},
        { $set: { [field]: safeImage, updatedBy: req.admin.id, updatedAt: new Date() } },
        { upsert: true }
      );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to update Who We Are image:", err);
    return res.status(500).json({ error: "Failed to save image" });
  }
});

export const onRequest = toPages(handler);
