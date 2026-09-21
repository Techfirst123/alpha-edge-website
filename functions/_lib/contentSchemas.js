// Field whitelists for the admin panel's editable content. Only fields
// listed here can be written — anything else in a request body is ignored —
// and every value is trimmed and capped to its max length before it reaches
// MongoDB. `type: "number"` fields are stored as numbers.

export const SINGLETON_SCHEMAS = {
  siteSettings: {
    site_name: 120,
    tagline: 160,
    phone_primary: 40,
    email_primary: 160,
    address_line1: 160,
    address_line2: 160,
    city: 80,
    postcode: 20,
    country: 80,
    linkedin_url: 300,
    facebook_url: 300,
    twitter_url: 300,
    instagram_url: 300,
    footer_about_text: 400,
    footer_copyright_text: 200,
  },
  homepageContent: {
    hero_cta_text: 60,
    hero_cta_link: 200,
    stats_projects: { type: "number" },
    stats_clients: { type: "number" },
    stats_support: 20,
    about_teaser_heading: 160,
    about_teaser_text: 600,
  },
  aboutContent: {
    heading: 160,
    intro_text: 1200,
    mission_text: 600,
    vision_text: 600,
  },
};

// List collections managed from the panel (one document per item, each with
// a numeric app-level `id`).
export const LIST_SCHEMAS = {
  services: {
    required: ["title"],
    fields: {
      title: 80,
      slug: 80,
      icon: { type: "enum", values: ["cloud", "shield", "support", "network", "code", "database", "chip", "headset"] },
      short_description: 300,
    },
  },
  team: {
    required: ["name"],
    fields: {
      name: 80,
      role: 120,
      bio: 400,
    },
  },
};

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Returns a clean { field: value } object for the fields present in `input`.
// Unknown fields are dropped; `partial` = only fields that were sent.
export function sanitize(schemaFields, input, { partial = true } = {}) {
  const out = {};
  for (const [field, rule] of Object.entries(schemaFields)) {
    if (partial && (input == null || input[field] === undefined)) continue;
    const raw = input?.[field];

    if (typeof rule === "number") {
      out[field] = String(raw ?? "").trim().slice(0, rule);
    } else if (rule.type === "number") {
      const n = Number(raw);
      out[field] = Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
    } else if (rule.type === "enum") {
      out[field] = rule.values.includes(raw) ? raw : rule.values[0];
    }
  }
  return out;
}
