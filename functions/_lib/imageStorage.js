// Cloudflare Pages Functions have no writable local filesystem at all
// (every deploy is immutable, and there's no disk to write to even
// temporarily) — unlike Vercel, where the old version of this file wrote
// straight to public/uploads/ with node:fs. Images now go to a Cloudflare
// R2 bucket instead; functions/uploads/[[path]].js serves them back out at
// the same /uploads/... URL shape the rest of the app already expects, so
// nothing that *stores* an image URL (MongoDB documents, the frontend)
// needs to change.

const EXTENSION_BY_CONTENT_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

const CONTENT_TYPE_BY_EXTENSION = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

export function extensionForContentType(contentType) {
  return EXTENSION_BY_CONTENT_TYPE[contentType] || "jpg";
}

// Saves `buffer` into the UPLOADS_BUCKET R2 bucket under <folder>/ and
// returns its public URL path (e.g. "/uploads/products/173...jpg") — that's
// what gets stored in MongoDB, never the image bytes themselves, exactly
// like the old fs-based version.
export async function saveImageFile(env, buffer, folder, extension) {
  const bucket = env?.UPLOADS_BUCKET;
  if (!bucket) {
    throw new Error(
      "UPLOADS_BUCKET R2 binding is not configured — add an R2 bucket binding named UPLOADS_BUCKET in wrangler.toml / the Cloudflare Pages dashboard"
    );
  }

  const safeFolder = String(folder || "misc").replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "misc";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const key = `${safeFolder}/${filename}`;

  await bucket.put(key, buffer, {
    httpMetadata: {
      contentType: CONTENT_TYPE_BY_EXTENSION[extension] || "application/octet-stream",
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return `/uploads/${key}`;
}
