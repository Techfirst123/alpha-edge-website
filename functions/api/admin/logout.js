import { clearSessionCookie } from "../../_lib/auth.js";
import { toPages } from "../../_lib/adapter.js";


async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Set-Cookie", clearSessionCookie());
  return res.status(200).json({ success: true });
}

export const onRequest = toPages(handler);
