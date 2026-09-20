// Native Cloudflare Worker entry point.
//
// This project's Cloudflare account creates "Workers" (not classic "Pages"
// projects) when you connect a GitHub repo for auto-deploys, so the
// Pages-style file-based routing under functions/ is never actually invoked
// by Cloudflare at runtime — there is no Pages project for it to route
// through. This file replaces that automatic routing with an explicit
// router that dispatches to the exact same handler modules (unchanged),
// and falls back to serving the built static site (env.ASSETS) for
// everything else. SPA client-side routing fallback (unknown paths ->
// index.html) is handled declaratively via `not_found_handling` in
// wrangler.toml, not in this file.
 
import { onRequest as aboutContent } from "../functions/api/about-content.js";
import { onRequest as contact } from "../functions/api/contact.js";
import { onRequest as expertiseTiles } from "../functions/api/expertise-tiles.js";
import { onRequest as heroSlides } from "../functions/api/hero-slides.js";
import { onRequest as homepageContent } from "../functions/api/homepage-content.js";
import { onRequest as leads } from "../functions/api/leads.js";
import { onRequest as products } from "../functions/api/products.js";
import { onRequest as ratingsSummary } from "../functions/api/ratings-summary.js";
import { onRequest as ratings } from "../functions/api/ratings.js";
import { onRequest as services } from "../functions/api/services.js";
import { onRequest as siteSettings } from "../functions/api/site-settings.js";
import { onRequest as supplyCategories } from "../functions/api/supply-categories.js";
import { onRequest as team } from "../functions/api/team.js";
import { onRequest as track } from "../functions/api/track.js";
import { onRequest as whoWeAreImages } from "../functions/api/who-we-are-images.js";
 
import { onRequest as adminAdmins } from "../functions/api/admin/admins.js";
import { onRequest as adminAnalytics } from "../functions/api/admin/analytics.js";
import { onRequest as adminExpertiseTiles } from "../functions/api/admin/expertise-tiles.js";
import { onRequest as adminHeroSlides } from "../functions/api/admin/hero-slides.js";
import { onRequest as adminImportProducts } from "../functions/api/admin/import-products.js";
import { onRequest as adminLogin } from "../functions/api/admin/login.js";
import { onRequest as adminLogout } from "../functions/api/admin/logout.js";
import { onRequest as adminMe } from "../functions/api/admin/me.js";
import { onRequest as adminProductStats } from "../functions/api/admin/product-stats.js";
import { onRequest as adminProducts } from "../functions/api/admin/products.js";
import { onRequest as adminRatings } from "../functions/api/admin/ratings.js";
import { onRequest as adminSupplyCategories } from "../functions/api/admin/supply-categories.js";
import { onRequest as adminUploadImage } from "../functions/api/admin/upload-image.js";
import { onRequest as adminWhoWeAreImages } from "../functions/api/admin/who-we-are-images.js";
 
import { onRequestGet as uploadsGet } from "../functions/uploads/[[path]].js";
 
// Exact-path routes (mirrors the flat file layout under functions/api/).
const routes = {
  "/api/about-content": aboutContent,
  "/api/contact": contact,
  "/api/expertise-tiles": expertiseTiles,
  "/api/hero-slides": heroSlides,
  "/api/homepage-content": homepageContent,
  "/api/leads": leads,
  "/api/products": products,
  "/api/ratings-summary": ratingsSummary,
  "/api/ratings": ratings,
  "/api/services": services,
  "/api/site-settings": siteSettings,
  "/api/supply-categories": supplyCategories,
  "/api/team": team,
  "/api/track": track,
  "/api/who-we-are-images": whoWeAreImages,
  "/api/admin/admins": adminAdmins,
  "/api/admin/analytics": adminAnalytics,
  "/api/admin/expertise-tiles": adminExpertiseTiles,
  "/api/admin/hero-slides": adminHeroSlides,
  "/api/admin/import-products": adminImportProducts,
  "/api/admin/login": adminLogin,
  "/api/admin/logout": adminLogout,
  "/api/admin/me": adminMe,
  "/api/admin/product-stats": adminProductStats,
  "/api/admin/products": adminProducts,
  "/api/admin/ratings": adminRatings,
  "/api/admin/supply-categories": adminSupplyCategories,
  "/api/admin/upload-image": adminUploadImage,
  "/api/admin/who-we-are-images": adminWhoWeAreImages,
};
 
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Normalize away a single trailing slash (but keep "/" itself).
    const pathname =
      url.pathname.length > 1 && url.pathname.endsWith("/")
        ? url.pathname.slice(0, -1)
        : url.pathname;
 
    // R2-backed uploads catch-all: /uploads/<folder>/<filename>
    if (pathname === "/uploads" || pathname.startsWith("/uploads/")) {
      const path = pathname
        .replace(/^\/uploads\/?/, "")
        .split("/")
        .filter(Boolean);
      return uploadsGet({
        request,
        env,
        params: { path },
        waitUntil: (p) => ctx.waitUntil(p),
      });
    }
 
    const handler = routes[pathname];
    if (handler) {
      return handler({
        request,
        env,
        params: {},
        waitUntil: (p) => ctx.waitUntil(p),
      });
    }
 
    // Everything else: serve the built static site. Unknown paths (client
    // router routes like /products/123) fall back to index.html via the
    // `not_found_handling = "single-page-application"` setting below.
    return env.ASSETS.fetch(request);
  },
};