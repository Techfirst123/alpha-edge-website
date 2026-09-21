import { useNavigate } from "react-router-dom";
import {
  FaArrowRight, FaNetworkWired, FaServer, FaHdd, FaSitemap,
  FaPlug, FaStream, FaCheck,
} from "react-icons/fa";

import { imageFor } from "../utils/productImage";
import { availabilityLabel } from "../utils/productAvailability";

import "./ProductCard.css";

const CATEGORY_ICONS = {
  switch: FaNetworkWired,
  router: FaStream,
  server: FaServer,
  storage: FaHdd,
  hub: FaSitemap,
  optic: FaPlug,
};

const CONDITION_LABELS = { new: "New", refurb: "Refurb" };

// "48, UPOE" -> ["48", "UPOE"]
function parseSpecs(raw) {
  if (!raw) return [];
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

// Read-only product card — products are edited in the admin panel.
export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const Icon = CATEGORY_ICONS[product.category] || FaNetworkWired;
  const image = imageFor(product);

  const productId = product._id ?? product.id;
  const productDetailsHref = `/products/${productId}`;
  const quoteHref = `/get-a-quote?model=${encodeURIComponent(
    product.model
  )}&product=${encodeURIComponent(product.name)}`;

  // The SKU/model leads the card (as on the reference site) and the full
  // product name becomes the supporting description. Falls back to the name
  // when a product has no model recorded, so the card is never headless.
  const heading = product.model || product.name;
  const description = product.model ? product.name : product.short_description;

  const condition = CONDITION_LABELS[product.condition] ? product.condition : null;
  const specs = parseSpecs(product.specs);
  const availability = availabilityLabel(product.stock);

  const openProductDetails = () => navigate(productDetailsHref);

  const handleCardKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openProductDetails();
    }
  };

  return (
    <article
      className="product-card"
      onClick={openProductDetails}
      onKeyDown={handleCardKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`View ${product.name} details`}
    >
      <div className="product-card__media">
        {image ? (
          <img
            className="product-card__img"
            src={image}
            alt={product.category_label || product.category}
            loading="lazy"
          />
        ) : (
          <Icon className="product-card__glyph" aria-hidden="true" />
        )}

        {condition && (
          <span className={`product-condition product-condition--${condition}`}>
            {CONDITION_LABELS[condition]}
          </span>
        )}
      </div>

      <div className="product-card__body">
        <span className="product-card__price-lead">Price on request</span>
        <span className="product-card__availability">{availability}</span>

        {product.warranty && (
          <span className="product-card__warranty">
            <FaCheck aria-hidden="true" /> {product.warranty}
          </span>
        )}

        {product.brand && (
          <span className="product-card__maker">{product.brand}</span>
        )}

        <h3>{heading}</h3>

        {specs.length > 0 && (
          <ul className="product-card__specs">
            {specs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}

        {description && <p className="product-card__desc">{description}</p>}

        <div className="product-card__foot">
          <button
            type="button"
            className="btn btn-primary product-card__cta"
            onClick={(e) => {
              e.stopPropagation();
              navigate(quoteHref);
            }}
          >
            Request Price
            <FaArrowRight />
          </button>
        </div>
      </div>
    </article>
  );
}
