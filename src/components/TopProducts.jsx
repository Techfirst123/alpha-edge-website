import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FaArrowRight,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaShieldAlt,
  FaTruck,
} from "react-icons/fa";
import { imageFor } from "../utils/productImage";
import { availabilityLabel } from "../utils/productAvailability";
import { getProducts } from "../api/client";
import { placeholderProducts } from "../data/placeholder";
import "./TopProducts.css";

const EASE = [0.22, 1, 0.36, 1];
const CONDITION_LABELS = { new: "New", refurb: "Refurbished" };

// Home page picks are the products an admin starred for the Top 10 in the
// admin panel. If none are starred yet, show the first few products so the
// section is never empty.
function pickHomepageProducts(products) {
  const featured = products.filter((p) => p.featured);
  const list = featured.length ? featured : products;
  return [...list].sort((a, b) => (a.id ?? 0) - (b.id ?? 0)).slice(0, 10);
}

const specsOf = (raw) =>
  String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

function PickCard({ p, index }) {
  const image = imageFor(p);
  const id = p._id ?? p.id;
  const quoteHref = `/get-a-quote?model=${encodeURIComponent(p.model || "")}&product=${encodeURIComponent(p.name || "")}`;
  const specs = specsOf(p.specs);

  return (
    <motion.article
      className="tp-card"
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: EASE, delay: Math.min(index, 6) * 0.05 }}
    >
      <Link to={`/products/${id}`} className="tp-card__media" aria-label={`View ${p.name}`}>
        {image ? <img src={image} alt={p.name} loading="lazy" /> : <span className="tp-card__fallback">{p.category_label}</span>}
        <span className="tp-card__badges">
          {p.brand && <span className="tp-badge tp-badge--brand">{p.brand}</span>}
          {CONDITION_LABELS[p.condition] && (
            <span className={`tp-badge tp-badge--${p.condition}`}>{CONDITION_LABELS[p.condition]}</span>
          )}
        </span>
        <span className="tp-card__view">
          <FaEye /> Quick view
        </span>
      </Link>

      <div className="tp-card__body">
        <span className="tp-card__cat">{p.category_label}</span>
        <h3 className="tp-card__title">
          <Link to={`/products/${id}`}>{p.name}</Link>
        </h3>
        {p.model && <span className="tp-card__model">{p.model}</span>}

        {specs.length > 0 && (
          <ul className="tp-card__specs">
            {specs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}

        <span className="tp-card__stock">
          <FaCheckCircle /> {availabilityLabel(p.stock)}
        </span>

        <div className="tp-card__actions">
          <Link to={quoteHref} className="tp-btn tp-btn--primary">
            Request price
          </Link>
          <Link to={`/products/${id}`} className="tp-btn tp-btn--ghost" aria-label={`Details for ${p.name}`}>
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function TopProducts() {
  const reduceMotion = useReducedMotion();
  const [products, setProducts] = useState(placeholderProducts);
  const [cat, setCat] = useState("all");
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const railRef = useRef(null);

  useEffect(() => {
    getProducts()
      .then((d) => d.length && setProducts(d))
      .catch(() => setProducts(placeholderProducts));
  }, []);

  const picks = useMemo(() => pickHomepageProducts(products), [products]);

  // Category pills built from whatever categories the picks actually cover.
  const categories = useMemo(() => {
    const seen = new Map();
    picks.forEach((p) => p.category && !seen.has(p.category) && seen.set(p.category, p.category_label || p.category));
    return [...seen.entries()].map(([key, label]) => ({ key, label }));
  }, [picks]);

  const shown = cat === "all" ? picks : picks.filter((p) => p.category === cat);

  const measure = () => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 1);
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 });
  };

  useEffect(() => {
    const el = railRef.current;
    if (!el) return undefined;
    el.scrollTo({ left: 0 });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [cat, shown.length]);

  const scrollBy = (dir) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector(".tp-card");
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * (window.innerWidth > 900 ? 2 : 1), behavior: reduceMotion ? "auto" : "smooth" });
  };

  if (picks.length === 0) return null;

  return (
    <section className="section section-alt top-products">
      <div className="container">
        <div className="tp-head">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="eyebrow">Top Picks</span>
            <h2 className="section-heading">Products We Supply</h2>
            <p className="tp-head__sub">
              Hand-picked enterprise hardware, ready to ship. Open any item for full specs, or request a tailored price.
            </p>
          </motion.div>

          <div className="tp-head__side">
            <div className="tp-arrows">
              <button type="button" className="tp-arrow" onClick={() => scrollBy(-1)} disabled={edges.start} aria-label="Previous products">
                <FaChevronLeft />
              </button>
              <button type="button" className="tp-arrow" onClick={() => scrollBy(1)} disabled={edges.end} aria-label="Next products">
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>

        {categories.length > 1 && (
          <div className="tp-pills" role="tablist" aria-label="Filter by category">
            {[{ key: "all", label: "All picks" }, ...categories].map((c) => (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={cat === c.key}
                className={`tp-pill ${cat === c.key ? "is-active" : ""}`}
                onClick={() => setCat(c.key)}
              >
                {cat === c.key && <motion.span layoutId="tp-pill-bg" className="tp-pill__bg" transition={{ duration: 0.35, ease: EASE }} />}
                <span className="tp-pill__label">{c.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="container tp-rail-wrap">
        <div className="tp-rail" ref={railRef} onScroll={measure}>
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p, i) => (
              <PickCard key={p._id ?? p.id ?? p.model} p={p} index={i} />
            ))}
          </AnimatePresence>
        </div>

        <div className="tp-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} />
        </div>
      </div>

      <div className="container">
        <div className="tp-foot">
          <ul className="tp-trust">
            <li>
              <FaShieldAlt /> Genuine, sealed or certified refurbished
            </li>
            <li>
              <FaTruck /> Worldwide delivery · 3-5 days
            </li>
            <li>
              <FaCheckCircle /> Tailored quotes within one business day
            </li>
          </ul>
          <Link to="/products" className="btn btn-primary">
            View all products <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
