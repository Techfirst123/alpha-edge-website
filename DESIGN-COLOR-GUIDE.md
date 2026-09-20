# Design & Colour Guide — Alpha Edge

A short, reusable playbook so colour and layout stay consistent while you keep
building. It has three parts: a **copy-paste prompt**, a **colour recipe**, and a
**structure checklist**. Everything is driven from the tokens in
`src/index.css` — change them there and the whole site follows.

---

## 1) Copy-paste prompt (use this with any AI, or as your own brief)

> You are a senior UI designer. I'm building a **B2B IT-reseller website** in
> React (Vite). It must feel **modern, trustworthy, and premium**, not generic.
>
> **Brand & mood:** [e.g. confident, enterprise, high-tech]. Audience:
> [IT buyers / procurement].
> **Lead colour:** [e.g. Royal Indigo #4338CA]. Keep ONE dominant colour; do not
> spread 3–4 strong colours around.
> **Feel:** [dark + light rhythm / mostly light / mostly dark].
>
> Give me a **colour system as CSS custom properties** with these roles:
> - `--primary` (the lead colour) + `--primary-600/700` for hover/darker
> - `--dark-900/800` (deep version of the lead, for dark sections)
> - one **accent** (a complementary warm/pop colour, used ≤10% of the page)
> - neutrals: `--ink` (text), `--muted` (secondary text), `--bg` (page),
>   `--surface` (cards)
> - semantic: `--success`, `--warning`, `--danger`
>
> Rules:
> - Follow **60 / 30 / 10**: 60% neutral, 30% dark/primary surfaces, 10% accent.
> - Every text/background pair must pass **WCAG AA** (body ≥ 4.5:1, large ≥ 3:1).
> - Buttons/links = primary; small highlights (eyebrows, active states) = accent.
> - Give me light-mode values, and note which sections should be **dark** for
>   rhythm (hero, CTA, footer are good candidates).
> - Output the hex values in a `:root { }` block I can paste in, plus one
>   sentence on where each token is used.
>
> Then propose a **type scale** (display / heading / body / caption) and an
> **8-pt spacing scale**, and describe a **section rhythm** (light → dark → light)
> for a homepage with: hero, services, brands/products, testimonials, CTA, footer.

Fill in the `[brackets]` and you'll get a consistent system every time.

---

## 2) Colour recipe (the short version)

**Pick by role, not by "nice colours":**
1. **One lead colour** — carries buttons, links, icons, key headings. (Yours: indigo `#4338CA`.)
2. **A deep version of it** — for dark sections (hero, CTA, footer). (Yours: `#1E1B4B` / `#312E81`.)
3. **One accent** — a *different* hue for small pops only: eyebrows, badges, active dots. (Yours: amber `#F59E0B`.) Keep it to ~10% of the page.
4. **Neutrals** — near-black text (`--ink`), grey secondary text (`--muted`), a light page bg, white cards. Give neutrals a *tiny* tint of the lead colour so they feel intentional, never pure `#808080`.
5. **Semantic** — green = in-stock/success, amber = on-order/warning, red = error. These are separate from your accent.

**Ratios:** 60% neutral · 30% dark/primary surfaces · 10% accent. If a page feels
"too [colour]", you're over 10% on that colour — pull it back to accents only.

**Contrast:** check text on its background at webaim.org/resources/contrastchecker.
Body text ≥ 4.5:1, large headings ≥ 3:1. White text needs a dark-enough surface
(indigo `#4338CA` passes; a light amber does not — use dark text on amber).

---

## 3) Structure checklist (keeps layouts tidy)

- **Spacing = one scale.** Use multiples of 8px (8/16/24/32/48/64/96). Don't invent 13px, 27px gaps.
- **Type = one scale.** Display (clamp 28–44px) → H2 (24–32) → H3 (18–20) → body (16) → caption (12–14). One display font (Rajdhani) + one body font (Nunito) — you already have this.
- **Section rhythm.** Alternate light and dark sections so the page breathes: hero (dark) → services (light) → brands (light) → a dark band → CTA (dark) → footer (dark).
- **Cards are one object.** Same radius, padding, border and shadow on every card in a row. Lift/tilt on hover, don't restyle each one.
- **Reuse tokens, never hard-code hex** in components. If you need indigo, write `var(--blue-600)`, not `#4338CA`. That's why a full re-colour is a 20-line change.
- **Accessibility:** visible focus rings, `alt` on images, 44px min tap targets, respect `prefers-reduced-motion`.

---

## 4) Where the tokens live (your project)

All colours are in **`src/index.css` → `:root`**. The names are historical
(`--blue-600` etc.) but hold the *current* palette. To re-theme the whole site,
edit only those values — every component reads them:

| Token | Role now (Royal Indigo) |
|---|---|
| `--blue-600` / `--blue-500` | Primary indigo + hover |
| `--navy-900` / `--navy-800` | Deep indigo darks (hero, CTA, footer, dark cards) |
| `--cyan-300` | Light indigo for text on dark |
| `--red-accent` (`--amber`) | Amber accent (eyebrows, pops) |
| `--ink` / `--muted` | Text + secondary text |
| `--bg` / `--white` | Page background + cards |
| `--gradient-brand` / `--gradient-accent` | Icon badges / accent bars |

Change the lead colour later? Swap `--blue-600/500`, `--navy-900/800`, and the
two gradients — done, no component edits needed.
