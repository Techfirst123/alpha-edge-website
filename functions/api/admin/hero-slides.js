import { getDb } from "../../_lib/mongodb.js";
import { requireAdmin } from "../../_lib/auth.js";
import { checkImageValue } from "../../_lib/handlers.js";
import { toPages } from "../../_lib/adapter.js";

// Updates exactly one hero slide (by index 0-3): eyebrow, heading, subtitle
// and image. No styling/effect/color fields exist here to change — those
// live only in HeroSlider.jsx/.css, untouched by this endpoint.


const handler = requireAdmin(async (req, res) => {
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { index, eyebrow, heading, subtitle, image } = req.body || {};
  if (!Number.isInteger(index) || index < 0 || index > 3) {
    return res.status(400).json({ error: "index must be an integer 0-3" });
  }

  let safeImage;
  try {
    safeImage = checkImageValue(image);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const slide = {
    eyebrow: String(eyebrow || "").slice(0, 120),
    heading: String(heading || "").slice(0, 160),
    subtitle: String(subtitle || "").slice(0, 300),
    image: safeImage,
  };

  try {
    const db = await getDb();
    await db
      .collection("heroSlides")
      .updateOne(
        {},
        { $set: { [`slides.${index}`]: slide, updatedBy: req.admin.id, updatedAt: new Date() } },
        { upsert: true }
      );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to update hero slide:", err);
    return res.status(500).json({ error: "Failed to save slide" });
  }
});

export const onRequest = toPages(handler);
