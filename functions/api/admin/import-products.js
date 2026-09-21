import ExcelJS from "exceljs";
import { getDb } from "../../_lib/mongodb.js";
import { saveImageFile } from "../../_lib/imageStorage.js";
import { requireAdmin } from "../../_lib/auth.js";
import { toPages } from "../../_lib/adapter.js";
 
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_ROWS = 300; // keeps the request inside the serverless function's time limit
 
// Recognised column headers, case/space-insensitive, mapped to our product
// schema. Extra columns in the sheet are simply ignored.
const COLUMN_ALIASES = {
  category: "category",
  "category label": "category_label",
  categorylabel: "category_label",
  brand: "brand",
  name: "name",
  model: "model",
  "model no": "model",
  "model number": "model",
  "short description": "short_description",
  description: "short_description",
  stock: "stock",
  "lead time": "lead_time",
  leadtime: "lead_time",
  condition: "condition",
  specs: "specs",
  spec: "specs",
  warranty: "warranty",
  image: "image",
  "image url": "image",
  "image path": "image",
  id: "id",
  featured: "featured",
  "top 10": "featured",
  top10: "featured",
};
 
const TRUE_VALUES = new Set(["true", "1", "yes", "y"]);
 
// Spellings accepted in a sheet's "condition" column, mapped to the two
// values the product card understands.
const CONDITION_FROM_SHEET = {
  new: "new",
  sealed: "new",
  "factory sealed": "new",
  refurb: "refurb",
  refurbished: "refurb",
  "renewed": "refurb",
  used: "refurb",
};
 
// Accepts "short_description", "Short Description" or "short description"
// interchangeably — normalize underscores/extra whitespace to a single
// space before matching against COLUMN_ALIASES.
function normalizeHeader(h) {
  return String(h || "").trim().toLowerCase().replace(/[_\s]+/g, " ").trim();
}
 
function decodeDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || "");
  if (!match) return null;
  return { contentType: match[1], buffer: Buffer.from(match[2], "base64") };
}
 
function extensionFromUrl(url) {
  const m = /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.exec(url);
  return m ? m[1].toLowerCase() : "jpg";
}
 
async function uploadImageFromUrl(env, url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not fetch image (${response.status})`);
  const arrayBuffer = await response.arrayBuffer();
  return saveImageFile(env, Buffer.from(arrayBuffer), "products", extensionFromUrl(url));
}
 
async function resolveImage(env, rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) {
    return uploadImageFromUrl(env, value); // download the linked photo, re-host it in our own /uploads folder
  }
  return value; // already a site-relative path — use as-is
}
 
 
const handler = requireAdmin(async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
 
  const { file } = req.body || {};
  const decoded = decodeDataUrl(file);
  if (!decoded) {
    return res.status(400).json({ error: "file must be a base64-encoded .xlsx file" });
  }
  if (decoded.buffer.length > MAX_FILE_BYTES) {
    return res.status(400).json({ error: `File too large — please keep it under ${MAX_FILE_BYTES / 1024 / 1024}MB` });
  }
 
  let worksheet;
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(decoded.buffer);
    worksheet = workbook.worksheets[0];
  } catch (err) {
    console.error("Failed to parse Excel file:", err);
    return res.status(400).json({ error: "Couldn't read that file — is it a valid .xlsx spreadsheet?" });
  }
 
  if (!worksheet || worksheet.rowCount < 2) {
    return res.status(400).json({ error: "Sheet has no data rows" });
  }
 
  const headerRow = worksheet.getRow(1);
  const columnMap = {}; // column index -> our field name
  headerRow.eachCell((cell, colNumber) => {
    const field = COLUMN_ALIASES[normalizeHeader(cell.value)];
    if (field) columnMap[colNumber] = field;
  });
 
  if (!Object.values(columnMap).includes("name") || !Object.values(columnMap).includes("model")) {
    return res.status(400).json({ error: "Sheet must include at least 'name' and 'model' columns" });
  }
  const hasFeaturedColumn = Object.values(columnMap).includes("featured");
 
  const totalDataRows = worksheet.rowCount - 1;
  if (totalDataRows > MAX_ROWS) {
    return res.status(400).json({ error: `Too many rows (${totalDataRows}) — please split into batches of ${MAX_ROWS} or fewer` });
  }
 
  const db = await getDb();
  const productsCollection = db.collection("products");
  const existingMax = await productsCollection
    .find({}, { projection: { id: 1 } })
    .sort({ id: -1 })
    .limit(1)
    .toArray();
  let nextId = (existingMax[0]?.id || 0) + 1;
 
  let imported = 0;
  let updated = 0;
  const errors = [];
 
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    if (row.cellCount === 0) continue;
 
    const raw = {};
    row.eachCell((cell, colNumber) => {
      const field = columnMap[colNumber];
      if (field) raw[field] = cell.value;
    });
    if (!raw.name && !raw.model) continue; // skip blank rows
 
    try {
      const category = String(raw.category || "").trim().toLowerCase() || "optic";
      const product = {
        category,
        category_label: String(raw.category_label || "").trim() || category,
        brand: String(raw.brand || "").trim(),
        name: String(raw.name || "").trim(),
        model: String(raw.model || "").trim(),
        short_description: String(raw.short_description || "").trim(),
        stock: String(raw.stock || "in").trim().toLowerCase() === "order" ? "order" : "in",
        lead_time: String(raw.lead_time || "In stock").trim(),
        // Card extras. `condition` drives the New/Refurb badge and is left
        // empty (badge hidden) unless the sheet says one or the other, so a
        // sheet without the column never implies a condition it doesn't know.
        condition: CONDITION_FROM_SHEET[String(raw.condition || "").trim().toLowerCase()] || "",
        specs: String(raw.specs || "").trim().slice(0, 120),
        warranty: String(raw.warranty || "").trim().slice(0, 80),
        image: await resolveImage(req.env, raw.image),
      };
 
      if (!product.model) {
        errors.push({ row: rowNumber, message: "Missing model — row skipped" });
        continue;
      }
 
      const existing = await productsCollection.findOne({ model: product.model });
      if (existing) {
        // Only touch `featured` (the homepage Top 10 flag) if this sheet
        // actually has that column — an unrelated bulk price/stock refresh
        // shouldn't silently clear an admin's existing Top 10 picks.
        if (hasFeaturedColumn) {
          product.featured = TRUE_VALUES.has(String(raw.featured || "").trim().toLowerCase());
        }
        await productsCollection.updateOne({ model: product.model }, { $set: product });
        updated += 1;
      } else {
        const id = Number.isFinite(Number(raw.id)) ? Number(raw.id) : nextId++;
        product.featured = TRUE_VALUES.has(String(raw.featured || "").trim().toLowerCase());
        await productsCollection.updateOne({ id }, { $set: { id, ...product } }, { upsert: true });
        imported += 1;
      }
    } catch (err) {
      console.error(`Import row ${rowNumber} failed:`, err);
      errors.push({ row: rowNumber, message: err.message || "Failed to import this row" });
    }
  }
 
  return res.status(200).json({ imported, updated, errors });
});
 
export const onRequest = toPages(handler);
 