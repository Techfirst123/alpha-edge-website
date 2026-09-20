import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { imageFor } from "../utils/productImage";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { getProducts } from "../api/client";
import { placeholderProducts } from "../data/placeholder";
import "./TopProducts.css";

// Homepage picks are whatever an admin has checked "Display on homepage"
function pickHomepageProducts(products) {
  return products
    .filter((p) => p.featured)
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
    .slice(0, 10);
}

export default function TopProducts() {
  const { isAdmin } = useAdminAuth();
  const [products, setProducts] = useState(placeholderProducts);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    getProducts()
      .then((d) => d.length && setProducts(d))
      .catch(() => setProducts(placeholderProducts));
  }, []);

  const picks = pickHomepageProducts(products);

  // Duplicate products so the slider can loop continuously
  const sliderProducts = [...picks, ...picks];

  if (picks.length === 0 && !isAdmin) return null;

  return (
    <section className="section section-alt top-products">
      <div className="container">
        <span className="eyebrow">Top Picks</span>

        <h2 className="section-heading">Products We Supply</h2>

        <p className="section-subheading">
          A glimpse of what&rsquo;s in stock — tap a photo to see full specs,
          availability and pricing.
        </p>
      </div>

      {picks.length === 0 ? (
        <div className="container">
          <div className="top-products__empty">
            No products are marked to display on the homepage yet — open a
            product on the Products page and check &ldquo;Display on
            homepage&rdquo; to feature it here.
          </div>
        </div>
      ) : (
        <div
          className={`top-products__slider ${
            isPaused ? "top-products__slider--paused" : ""
          }`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="top-products__track">
            {sliderProducts.map((p, index) => {
              const image = imageFor(p);

              return (
                <Link
                  key={`${p.id ?? p.model}-${index}`}
                  to={`/products/${p._id}`}
                  className="top-products__tile"
                  aria-label={`View ${p.name}`}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={p.name}
                      loading="lazy"
                    />
                  ) : (
                    <span className="top-products__tile-fallback">
                      {p.category_label || p.category}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="container top-products__more">
        <Link to="/products" className="btn btn-primary">
          Show More — View All Products <FaArrowRight />
        </Link>
      </div>
    </section>
  );
} 