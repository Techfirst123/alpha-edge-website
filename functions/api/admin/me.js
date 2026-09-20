import { getSessionAdmin, createSessionCookie } from "../../_lib/auth.js";
import { toPages } from "../../_lib/adapter.js";


async function handler(req, res) {
  const admin = await getSessionAdmin(req);
  if (admin) {
    // Checking session status counts as activity — slide the session forward.
    res.setHeader("Set-Cookie", createSessionCookie(admin.id));
    return res.status(200).json({
      authenticated: true,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  }
  return res.status(200).json({ authenticated: false });
}

export const onRequest = toPages(handler);
