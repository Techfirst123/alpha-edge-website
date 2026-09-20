import { getDb } from "../_lib/mongodb.js";
import { toPages } from "../_lib/adapter.js";


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

  try {
    const db = await getDb();
    const result = await db.collection("leads").insertOne({
      name,
      email,
      phone: phone || "",
      company: company || "",
      subject: subject || "",
      service_interest: service_interest || "",
      budget: budget || "",
      message,
      source_page: source_page || "",
      created_at: new Date(),
    });

    return res.status(201).json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("Failed to save lead:", err);
    return res.status(500).json({ error: "Failed to save enquiry" });
  }
}

export const onRequest = toPages(handler);
