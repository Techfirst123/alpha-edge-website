// One-time (and safely re-runnable) script to populate MongoDB Atlas with
// starting content, copied from the old src/data/placeholder.js fallback.
// Uses $setOnInsert so it only fills in documents that don't exist yet —
// re-running this never overwrites content an admin has since edited.
// Run with:  npm run seed
import { MongoClient } from "mongodb";
import {
  placeholderSiteSettings,
  placeholderHome,
  placeholderAbout,
  placeholderServices,
  placeholderProducts,
  placeholderTeam,
  placeholderTestimonials,
} from "../src/data/placeholder.js";

// Text-only starting values for the admin-editable "What We Supply" list
// (kept in sync with DEFAULT_CATEGORIES in src/components/Technologies.jsx —
// icons there are assigned by rotation, not stored).
const supplyCategories = [
  { label: "Network Switches", sub: "Access to core, GbE–100G" },
  { label: "Routers & Gateways", sub: "Edge, SD-WAN, branch" },
  { label: "Firewalls & Security", sub: "NGFW, UTM appliances" },
  { label: "Access Points & Wi-Fi", sub: "Indoor, outdoor, controllers" },
  { label: "Servers & Compute", sub: "Rack, tower, blade" },
  { label: "Storage · NAS & SAN", sub: "Arrays, backup, expansion" },
  { label: "Optics · GLC & SFP", sub: "Transceivers, DAC, cabling" },
  { label: "IP Phones & UC", sub: "Handsets, gateways, DECT" },
];

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Put it in your .env file first.");
  process.exit(1);
}

async function insertIfMissing(db, collectionName, data) {
  const result = await db
    .collection(collectionName)
    .updateOne({}, { $setOnInsert: data }, { upsert: true });
  console.log(`  ${collectionName}: ${result.upsertedCount ? "created" : "already exists, left as-is"}`);
}

async function upsertListIfMissing(db, collectionName, items) {
  const existing = await db.collection(collectionName).countDocuments();
  if (existing > 0) {
    console.log(`  ${collectionName}: already has ${existing} documents, left as-is`);
    return;
  }
  for (const item of items) {
    await db.collection(collectionName).updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true });
  }
  console.log(`  ${collectionName}: ${items.length} documents created`);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "alphaedge");

  console.log(`Seeding database "${db.databaseName}"...`);
  await insertIfMissing(db, "siteSettings", placeholderSiteSettings);
  await insertIfMissing(db, "homepageContent", placeholderHome);
  await insertIfMissing(db, "aboutContent", placeholderAbout);
  await upsertListIfMissing(db, "services", placeholderServices);
  await upsertListIfMissing(db, "products", placeholderProducts);
  await upsertListIfMissing(db, "team", placeholderTeam);
  await upsertListIfMissing(db, "testimonials", placeholderTestimonials);
  await insertIfMissing(db, "supplyCategories", { categories: supplyCategories });

  console.log("Done.");
  await client.close();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
