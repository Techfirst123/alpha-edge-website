import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { imageFor } from "../utils/productImage";
import { getProducts } from "../api/client";
import { placeholderProducts } from "../data/placeholder";
import "./TopProducts.css";

const EASE = [0.22, 1, 0.36, 1];

// Home page picks are the products an admin starred for the Top 10 in the
// admin panel. If none are starred yet, show the first few products so the
// section is never empty.
function pickHomepageProducts(products) {
  const featured = products.filter((p) => p.featured);
  const list = featured.length ? featured : products;
  return [...list].sort((a, b) => (a.id ?? 0) - (b.id ?? 0)).slice(0, 10);
}

function PickTile({ p, hidden }) {
  const image = imageFor(p);
  const id = p._id ?? p.id;
  return (
    <Link
      to={`/products/${id}`}
      className="tp-tile"
      aria-label={`${p.model || p.name}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
    >
      <span className="tp-tile__frame">
        {image ? (
          <img src={image} alt={hidden ? "" : p.name} loading="lazy" />
        ) : (
          <span className="tp-tile__fallback">{p.category_label}</span>
        )}
      </span>
      <span className="tp-tile__model">{p.model || p.name}</span>
    </Link>
  );
}

export default function TopProducts() {
  const [products, setProducts] = useState(placeholderProducts);

  useEffect(() => {
    getProducts()
      .then((d) => d.length && setProducts(d))
      .catch(() => setProducts(placeholderProducts));
  }, []);

  const picks = useMemo(() => pickHomepageProducts(products), [products]);
  if (picks.length === 0) return null;

  // The row is rendered twice so the slide loops seamlessly; the second copy
  // is hidden from screen readers and keyboard focus.
  const duration = Math.max(24, picks.length * 5);

  return (
    <section className="section section-alt top-products">
      <div className="container">
        <motion.div
          className="tp-head"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="eyebrow">Top Picks</span>
          <h2 className="section-heading">Products We Supply</h2>
        </motion.div>
      </div>

      <div className="tp-marquee">
        <div className="tp-track" style={{ animationDuration: `${duration}s` }}>
          {picks.map((p) => (
            <PickTile key={`a-${p._id ?? p.id ?? p.model}`} p={p} />
          ))}
          {picks.map((p) => (
            <PickTile key={`b-${p._id ?? p.id ?? p.model}`} p={p} hidden />
          ))}
        </div>
      </div>

      <div className="container tp-more">
        <Link to="/products" className="btn btn-primary">
          View all products <FaArrowRight />
        </Link>
      </div>
    </section>
  );
}
