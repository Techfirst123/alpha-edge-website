# Alpha Edge IT Services — Public Website

React (Vite) frontend for **alphaedgeitservices.co.uk**. Pages: Home, About,
Who We Are, Services, Products, Contact, Get a Quote. All editable content
(services, products, testimonials, team, homepage/about copy, site settings)
lives in **MongoDB Atlas** and is served by this same project's own Vercel
serverless functions under `/api`; if the database is unreachable, the site
falls back to placeholder content in `src/data/placeholder.js` so it always
renders something reasonable.

## Setup

```bash
npm install
cp .env.example .env    # add your MongoDB Atlas connection string as MONGODB_URI
npm run seed             # one-time: populate Atlas with starting content
npm run dev
```

`npm run dev` serves the real `/api` functions too — `vite-api-plugin.js`
emulates Vercel's serverless functions inside Vite's own dev server (reading
`.env` the same way), so there's no need to install the Vercel CLI or sign
in to anything just to develop locally.

## Build

```bash
npm run build
```

Outputs a static production build to `dist/`. Deploy on Vercel — the `/api`
functions ship automatically alongside it. Set `MONGODB_URI` (and optionally
`MONGODB_DB`) under Project Settings → Environment Variables in the Vercel
dashboard; these must never be prefixed with `VITE_`, or they'd be exposed to
the browser.

## Structure

- `src/pages/` — Home, About, Who We Are, Services, Products, Contact, Get a Quote
- `src/components/` — Navbar, Footer, ServiceCard, StatBar, PageHero, Layout, CookieConsent
- `src/api/client.js` — calls this project's own `/api/*` serverless functions
- `src/data/placeholder.js` — fallback/seed content (source for `npm run seed`)
- `api/` — Vercel serverless functions (MongoDB-backed content + lead endpoints, contact email)
- `api/_lib/` — shared MongoDB connection + handler helpers (not served as endpoints)
- `scripts/seed.js` — one-time (re-runnable) script that loads `src/data/placeholder.js` into Atlas
- `vite-api-plugin.js` — dev-only Vite middleware that emulates `/api` locally (not used in production; Vercel serves the real functions there)

## Design

Color palette and gradient are derived from the Alpha Edge logo (deep navy →
blue → cyan accent). See CSS variables in `src/index.css`.
