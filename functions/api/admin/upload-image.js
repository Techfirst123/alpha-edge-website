import { saveImageFile, extensionForContentType } from "../../_lib/imageStorage.js";
import { requireAdmin } from "../../_lib/auth.js";
import { toPages } from "../../_lib/adapter.js";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB — generous for a photo

function decodeDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || "");
  if (!match) return null;
  const [, contentType, base64] = match;
  return { contentType, buffer: Buffer.from(base64, "base64") };
}

// Saves one admin-selected image into the UPLOADS_BUCKET R2 bucket (see
// functions/_lib/imageStorage.js) and returns its URL. That URL — never the
// raw image bytes — is what gets saved into MongoDB by the other
// /api/admin/* content endpoints, keeping those documents small.


const handler = requireAdmin(async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image, folder } = req.body || {};
  const decoded = decodeDataUrl(image);
  if (!decoded) {
    return res.status(400).json({ error: "image must be a base64 data URL" });
  }
  if (decoded.buffer.length > MAX_IMAGE_BYTES) {
    return res.status(400).json({ error: `Image too large — please use one under ${MAX_IMAGE_BYTES / 1024 / 1024}MB` });
  }

  try {
    const url = await saveImageFile(req.env, decoded.buffer, folder, extensionForContentType(decoded.contentType));
    return res.status(200).json({ url });
  } catch (err) {
    console.error("Image upload failed:", err);
    return res.status(502).json({ error: "Failed to upload image" });
  }
});

export const onRequest = toPages(handler);
