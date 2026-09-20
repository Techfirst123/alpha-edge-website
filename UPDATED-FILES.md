# Alpha Edge — everything changed this session

Complete project with all updates applied. Use the whole folder (recommended).
No new dependencies were added — your original node_modules works.

    npm install    # only if you don't already have node_modules
    npm run dev

## NEW files
- src/pages/Products.jsx         — Products marketplace page (search + RFQ)
- src/pages/Products.css         — its styles
- UPDATED-FILES.md               — this file

## CHANGED files
- src/App.jsx                    — added the /products route
- src/components/Navbar.jsx      — search bar in the menu + hamburger on all sizes
- src/components/Navbar.css      — matching nav styles
- src/components/HeroSlider.jsx  — added the readability overlay element
- src/components/HeroSlider.css  — hero scrim + mobile arrow/layout fix
- src/components/ServiceCard.jsx — modern flip card, whole card clickable (plain CSS)
- src/components/ServiceCard.css — flip-card styles + light section background
- src/pages/Home.jsx             — services section light-bg class
- src/pages/GetQuote.jsx         — pre-fill from ?model= links
- src/data/placeholder.js        — product catalogue + categories

## Note on Tailwind / Bootstrap
These were rolled back. They weren't compiling in the build, which left the
services cards unstyled (front + back stacked as plain text). Everything now
uses plain CSS and runs with your existing dependencies. If you still want
Tailwind and/or Bootstrap, I can set them up again carefully as a separate step
and confirm the build before handing it over.

Your hero images and all other pages/content are unchanged.
