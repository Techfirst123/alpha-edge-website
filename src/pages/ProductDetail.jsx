import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaBoxOpen,
  FaTag,
  FaIndustry,
} from "react-icons/fa";
import { getProducts } from "../api/client";
import { imageFor } from "../utils/productImage";
import { placeholderProducts } from "../data/placeholder";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  getProducts()
    .then((products) => {
      console.log("URL PRODUCT ID:", productId);
      console.log("ALL PRODUCTS:", products);

      const selectedProduct = products.find(
        (p) =>
          String(p.id) === String(productId) ||
          String(p._id) === String(productId)
      );

      setProduct(selectedProduct || null);
    })
    .catch(() => {
      const selectedProduct = placeholderProducts.find(
        (p) =>
          String(p.id) === String(productId) ||
          String(p._id) === String(productId)
      );

      setProduct(selectedProduct || null);
    })
    .finally(() => setLoading(false));
}, [productId]);

  if (loading) {
    return (
      <section className="product-detail-page">
        <div className="container product-detail-loading">
          <div className="product-detail-loader" />
          <p>Loading product details...</p>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-detail-page">
        <div className="container product-detail-not-found">
          <span className="eyebrow">Product</span>
          <h1>Product not found</h1>
          <p>
            The product you're looking for may no longer be available.
          </p>

          <Link to="/products" className="btn btn-primary">
            <FaArrowLeft /> Back to Products
          </Link>
        </div>
      </section>
    );
  }

  const image = imageFor(product);

  const quoteHref = `/get-a-quote?model=${encodeURIComponent(
    product.model || ""
  )}&product=${encodeURIComponent(product.name || "")}`;

  return (
    <main className="product-detail-page">
      {/* TOP BAR */}
      <div className="container">
        <Link to="/products" className="product-detail-back">
          <FaArrowLeft />
          Back to Products
        </Link>
      </div>

      {/* PRODUCT HERO */}
      <section className="product-detail">
        <div className="container">
          <div className="product-detail__card">

            {/* IMAGE */}
            <div className="product-detail__visual">
              <div className="product-detail__image-wrap">
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="product-detail__image"
                  />
                ) : (
                  <div className="product-detail__image-placeholder">
                    <FaBoxOpen />
                    <span>No product image</span>
                  </div>
                )}
              </div>

              <div className="product-detail__image-caption">
                <span>Product Image</span>
                <span>Model {product.model}</span>
              </div>
            </div>

            {/* INFO */}
            <div className="product-detail__content">

              <div className="product-detail__badges">
                <span className="product-detail__category">
                  {product.category_label || product.category}
                </span>

                <span
                  className={`product-detail__stock product-detail__stock--${product.stock}`}
                >
                  <i />
                  {product.stock === "in" ? "In stock" : "On order"}
                </span>
              </div>

              <p className="product-detail__eyebrow">
                {product.brand}
              </p>

              <h1>{product.name}</h1>

              <p className="product-detail__model">
                Model No. <strong>{product.model}</strong>
              </p>

              <div className="product-detail__divider" />

              <p className="product-detail__description">
                {product.short_description ||
                  "Product details and specifications are available on request."}
              </p>

              {/* QUICK DETAILS */}
              <div className="product-detail__facts">

                <div className="product-detail__fact">
                  <span className="product-detail__fact-icon">
                    <FaIndustry />
                  </span>
                  <div>
                    <small>BRAND</small>
                    <strong>{product.brand || "—"}</strong>
                  </div>
                </div>

                <div className="product-detail__fact">
                  <span className="product-detail__fact-icon">
                    <FaTag />
                  </span>
                  <div>
                    <small>CATEGORY</small>
                    <strong>
                      {product.category_label || product.category || "—"}
                    </strong>
                  </div>
                </div>

                <div className="product-detail__fact">
                  <span className="product-detail__fact-icon">
                    <FaBoxOpen />
                  </span>
                  <div>
                    <small>AVAILABILITY</small>
                    <strong>
                      {product.stock === "in" ? "In stock" : "On order"}
                    </strong>
                  </div>
                </div>

              </div>

              {/* PRICE / CTA */}
              <div className="product-detail__action">

                <div className="product-detail__price">
                  <span>TRADE PRICE</span>
                  <strong>On request</strong>
                  <small>
                    Get pricing based on your quantity and requirements.
                  </small>
                </div>

                <Link
                  to={quoteHref}
                  className="btn btn-primary product-detail__quote"
                >
                  Request a Quote
                  <FaArrowRight />
                </Link>

              </div>

              <div className="product-detail__trust">
                <FaCheckCircle />
                <span>No checkout or card payment — speak directly with our team.</span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* DETAILS SECTION */}
      <section className="product-detail-info">
        <div className="container">
          <div className="product-detail-info__heading">
            <span className="eyebrow">Product Information</span>
            <h2>Everything you need to know</h2>
          </div>

          <div className="product-detail-info__grid">

            <div className="product-detail-info__box">
              <span>PRODUCT</span>
              <h3>{product.name}</h3>
              <p>
                {product.short_description ||
                  "Contact our team for complete product information."}
              </p>
            </div>

            <div className="product-detail-info__box">
              <span>MODEL NUMBER</span>
              <h3>{product.model}</h3>
              <p>
                Share this model number with our team when requesting a quote.
              </p>
            </div>

            <div className="product-detail-info__box">
              <span>AVAILABILITY</span>
              <h3>
                {product.stock === "in" ? "In Stock" : "On Order"}
              </h3>
              <p>
                Availability can vary according to quantity and current
                requirements.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="product-detail-cta">
        <div className="container">
          <div className="product-detail-cta__inner">
            <div>
              <span className="eyebrow">Need this product?</span>
              <h2>Let's get the right price for you.</h2>
              <p>
                Send us the model and quantity. Our team will check
                availability and prepare a tailored quotation.
              </p>
            </div>

            <Link to={quoteHref} className="btn btn-primary">
              Request Price <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}