import { MongoClient } from "mongodb";
 
// IMPORTANT — this file behaves differently from the old Vercel version.
//
// On Vercel, caching a MongoClient at module scope was safe: a warm
// function instance reuses the same process, so the cached client's TCP
// socket was always used by the *same* execution context it was opened in.
//
// Cloudflare Workers isolate the I/O (TCP socket) opened during one request
// from every other request, even when the same isolate is reused for the
// next request. A MongoClient cached at module scope and reused across
// requests throws "Cannot perform I/O on behalf of a different request".
// So here we deliberately do NOT cache the client — every call connects
// fresh. The platform tears the socket down automatically when the request
// finishes, so there's no explicit client.close() to worry about (and
// nothing to leak if a request errors before reaching one).
//
// This costs a fresh TLS handshake per request instead of a warm pooled
// connection. If this becomes a real latency issue later, the fix is a
// Durable Object holding one long-lived connection, not module-scope
// caching — but for this project's traffic that's not needed yet.
 
// --- Connection-string credential encoding -------------------------------
//
// A MongoDB connection string is a URI, so any character in the username or
// password that is reserved in a URI (: / ? # [ ] @ and % itself) has to be
// percent-encoded. Atlas shows you the raw password, not the encoded one, so
// pasting it straight into the URI produces one of two failures:
//
//   * "Password contains unescaped characters" — the driver refuses outright
//   * "bad auth : authentication failed" — worse, because it looks like a
//     wrong password when actually the URI was split in the wrong place
//
// Rather than requiring whoever sets MONGODB_URI to hand-encode it, we
// normalize the credentials here. Anyone can paste the raw string Atlas gave
// them and it just works.
 
// Characters that are not legal unencoded inside a URI userinfo component.
const ILLEGAL_IN_USERINFO = /[:/?#[\]@]/;
// A '%' that isn't the start of a well-formed %XX escape.
const MALFORMED_ESCAPE = /%(?![0-9A-Fa-f]{2})/;
// What a host section should look like (host[:port], or a comma-separated
// seed list for non-SRV strings).
const PLAUSIBLE_HOST = /^[A-Za-z0-9.\-_:,]+$/;
 
function encodeCredential(value) {
  // If it contains nothing illegal and no malformed escapes, it's either
  // already encoded or needs no encoding — leave it exactly as given.
  if (!ILLEGAL_IN_USERINFO.test(value) && !MALFORMED_ESCAPE.test(value)) {
    return value;
  }
  // Otherwise treat it as a raw value and encode the whole thing. (A value
  // that mixes real %XX escapes with raw reserved characters would get its
  // '%' double-encoded here, but that combination doesn't occur in practice
  // — it would mean a password that is half-encoded already.)
  return encodeURIComponent(value);
}
 
/**
 * Percent-encode the username/password inside a MongoDB connection string,
 * leaving an already-correct string untouched. Returns the input unchanged
 * if it has no credentials or doesn't look like a MongoDB URI, so the driver
 * still produces its own (clearer) error for genuinely malformed input.
 */
export function normalizeMongoUri(rawUri) {
  const uri = String(rawUri).trim();
 
  const schemeMatch = /^(mongodb(?:\+srv)?:\/\/)/i.exec(uri);
  if (!schemeMatch) return uri;
 
  const scheme = schemeMatch[1];
  const rest = uri.slice(scheme.length);
 
  // The separator is the LAST '@' before the host — searching from the end
  // means a password containing '@' or '/' is still split correctly.
  const at = rest.lastIndexOf("@");
  if (at === -1) return uri; // no credentials supplied
 
  const userinfo = rest.slice(0, at);
  const afterAt = rest.slice(at + 1);
 
  // Sanity-check that what follows really is a host, so we don't mangle a
  // string whose '@' lives in the query (e.g. ?appName=a@b).
  const hostEnd = afterAt.search(/[/?#]/);
  const host = hostEnd === -1 ? afterAt : afterAt.slice(0, hostEnd);
  if (!host || !PLAUSIBLE_HOST.test(host)) return uri;
 
  // Username and password split on the FIRST ':' — a ':' in the password is
  // part of the password, not another separator.
  const colon = userinfo.indexOf(":");
  const user = colon === -1 ? userinfo : userinfo.slice(0, colon);
  const password = colon === -1 ? null : userinfo.slice(colon + 1);
 
  const encodedUser = encodeCredential(user);
  const credentials =
    password === null
      ? encodedUser
      : `${encodedUser}:${encodeCredential(password)}`;
 
  return `${scheme}${credentials}@${afterAt}`;
}
 
export async function getDb() {
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    throw new Error("MONGODB_URI is not set");
  }
 
  const uri = normalizeMongoUri(rawUri);
 
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