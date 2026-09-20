// Cloudflare Pages Functions use the Web-standard Request/Response API
// (onRequest(context) with context.request), not Vercel/Node's
// (req, res) => {} convention. Every handler in this project was written
// against that Vercel convention.
//
// Rather than rewrite ~28 endpoint files' business logic (auth checks,
// validation, Mongo queries — all the actual risk), this adapter builds a
// faithful `req`/`res` shim on top of the real Request/Response so every
// existing handler runs completely unchanged. `toPages(handler)` is the
// only thing each endpoint file needs to add.
//
// req.headers, req.query, req.body, req.method mirror what Vercel gives a
// handler. res.status/.json/.setHeader/.end mirror Vercel's res.
export function toPages(handler) {
  return async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    const headers = Object.fromEntries(request.headers.entries());
    // Cloudflare's own header is the trustworthy client IP — prefer it over
    // a spoofable X-Forwarded-For, but keep req.headers["x-forwarded-for"]
    // as the lookup key so api/_lib/rateLimit.js needs no changes at all.
    const cfIp = request.headers.get("cf-connecting-ip");
    if (cfIp) headers["x-forwarded-for"] = cfIp;

    const query = Object.fromEntries(url.searchParams.entries());

    let body = undefined;
    if (!["GET", "HEAD"].includes(request.method)) {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const text = await request.text();
        try {
          body = text ? JSON.parse(text) : {};
        } catch {
          body = {};
        }
      }
    }

    const req = {
      method: request.method,
      headers,
      query,
      body,
      url: url.pathname + url.search,
      // Cloudflare bindings (R2, KV, secrets, etc.) — not something Vercel's
      // req ever had, but the two handlers that need R2 for image storage
      // (admin/upload-image.js, admin/import-products.js) read it from here.
      env: context.env,
    };

    const resHeaders = new Headers();
    const state = { statusCode: 200, body: null, ended: false };

    const res = {
      status(code) {
        state.statusCode = code;
        return res;
      },
      setHeader(name, value) {
        // Vercel allows string or string[] (used here for things like
        // multiple Set-Cookie headers, or just a single Allow value).
        if (Array.isArray(value)) {
          value.forEach((v) => resHeaders.append(name, v));
        } else {
          resHeaders.set(name, value);
        }
        return res;
      },
      json(payload) {
        if (!resHeaders.has("Content-Type")) {
          resHeaders.set("Content-Type", "application/json");
        }
        state.body = JSON.stringify(payload);
        state.ended = true;
        return res;
      },
      end(payload) {
        state.body = payload ?? null;
        state.ended = true;
        return res;
      },
    };

    try {
      await handler(req, res);
    } catch (err) {
      console.error("Unhandled error in API handler:", err);
      if (!state.ended) {
        if (!resHeaders.has("Content-Type")) {
          resHeaders.set("Content-Type", "application/json");
        }
        state.statusCode = 500;
        state.body = JSON.stringify({ error: "Internal server error" });
      }
    }

    return new Response(state.body, { status: state.statusCode, headers: resHeaders });
  };
}
