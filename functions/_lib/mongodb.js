import { MongoClient } from "mongodb";

// IMPORTANT — this file behaves differently from the old Vercel version.
//
// On Vercel, caching a MongoClient at module scope was safe: a warm
// function instance reuses the same process, so the cached client's TCP
// socket was always used by the *same* execution context it was opened in.
//
// Cloudflare Workers/Pages Functions isolate the I/O (TCP socket) opened
// during one request from every other request, even when the same isolate
// is reused for the next request. A MongoClient cached at module scope and
// reused across requests throws "Cannot perform I/O on behalf of a
// different request". So here we deliberately do NOT cache the client —
// every call connects fresh. The platform tears the socket down
// automatically when the request finishes, so there's no explicit
// client.close() to worry about (and nothing to leak if a request errors
// before reaching one).
//
// This costs a fresh TLS handshake per request instead of a warm pooled
// connection. If this becomes a real latency issue later, the fix is a
// Durable Object holding one long-lived connection, not module-scope
// caching — but for this project's traffic that's not needed yet.
export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 5,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  });

  await client.connect();
  return client.db(process.env.MONGODB_DB || "alphaedge");
}
