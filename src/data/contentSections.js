// Static map of "what's editable where" for the Dashboard's Website Content
// hub. This isn't itself admin-editable content — it just points admins at
// the existing inline pencil-icon editors already live on each page (hero
// slider, supply categories, expertise photos, who-we-are photos, products),
// rather than duplicating a second content-editing system alongside them.
export const CONTENT_SECTIONS = [
  {
    page: "Home",
    path: "/",
    sections: [
      "Hero Slider — image, eyebrow, heading, subtitle (4 slides)",
      "What We Supply — category list",
      "Our Expertise — tile photos",
      "Top Products — pick which products appear (edit a product on the Products page)",
      "Ratings & Feedback — public submissions, read-only here",
    ],
  },
  {
    page: "About",
    path: "/about",
    sections: ["Banner photo"],
  },
  {
    page: "Who We Are",
    path: "/who-we-are",
    sections: ["Apart section photo", "Capability tile photos (4)"],
  },
  {
    page: "Products",
    path: "/products",
    sections: ["Every product — name, photo, brand, category label, description, stock, Top 10 flag"],
  },
];
