// Serves images out of the UPLOADS_BUCKET R2 bucket at /uploads/<key>,
// replacing the old dev/static serving of public/uploads/ (see
// functions/_lib/imageStorage.js for why images live in R2 now instead of
// on disk). [[path]] is Pages Functions' catch-all segment syntax — this
// file handles every request under /uploads/.
export async function onRequestGet(context) {
  const { params, env } = context;
  const key = Array.isArray(params.path) ? params.path.join("/") : String(params.path || "");

  if (!key || key.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const bucket = env.UPLOADS_BUCKET;
  if (!bucket) {
    return new Response("Uploads storage not configured", { status: 500 });
  }

  const object = await bucket.get(key);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  if (!headers.has("cache-control")) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  return new Response(object.body, { headers });
}
