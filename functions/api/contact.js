import { toPages } from "../_lib/adapter.js";
// Vercel Serverless Function — receives contact/quote form submissions and
// emails them to the business owner via Resend (https://resend.com).
//
// Required environment variables (set in Vercel project settings, NOT in
// the frontend .env — these must stay server-side only):
//   RESEND_API_KEY     - API key from the Resend dashboard
//   CONTACT_FROM_EMAIL - verified sender, e.g. "Alpha Edge Website <enquiries@alphaedgeitservices.co.uk>"
//   CONTACT_TO_EMAIL   - inbox that should receive enquiries, e.g. info@alphaedgeitservices.co.uk


async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    name,
    email,
    phone,
    company,
    subject,
    service_interest,
    budget,
    message,
    source_page,
  } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email and message are required" });
  }

  const { RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL } = process.env;

  if (!RESEND_API_KEY || !CONTACT_FROM_EMAIL || !CONTACT_TO_EMAIL) {
    console.error("Email not configured: missing RESEND_API_KEY / CONTACT_FROM_EMAIL / CONTACT_TO_EMAIL");
    return res.status(500).json({ error: "Email service not configured" });
  }

  const rows = [
    ["Name", name],
    ["Email", email],
    ["Phone", phone],
    ["Company", company],
    ["Service Interested In", service_interest],
    ["Budget", budget],
    ["Subject", subject],
    ["Source Page", source_page],
  ].filter(([, value]) => Boolean(value));

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a;">
      <h2 style="margin-bottom: 16px;">New enquiry from ${escapeHtml(source_page || "website")}</h2>
      <table cellpadding="6" style="border-collapse: collapse;">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="font-weight:bold; vertical-align:top;">${escapeHtml(label)}</td><td>${escapeHtml(String(value))}</td></tr>`
          )
          .join("")}
        <tr><td style="font-weight:bold; vertical-align:top;">Message</td><td>${escapeHtml(message).replace(/\n/g, "<br/>")}</td></tr>
      </table>
    </div>
  `;

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: CONTACT_TO_EMAIL,
        reply_to: email,
        subject: subject ? `Website Enquiry: ${subject}` : `New Website Enquiry from ${name}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend API error:", errText);
      return res.status(502).json({ error: "Failed to send email" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Email send failed:", err);
    return res.status(502).json({ error: "Failed to send email" });
  }
}

function escapeHtml(str) {
  return str.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

export const onRequest = toPages(handler);
