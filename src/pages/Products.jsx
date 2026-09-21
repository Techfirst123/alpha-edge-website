import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  FaArrowRight,
  FaSearch,
  FaTimes,
  FaCheckCircle,
  FaFileExcel,
} from "react-icons/fa";

import PageHero from "../components/PageHero";
import ImportProductsModal from "../components/ImportProductsModal";
import ProductCard from "../components/ProductCard";

import { useAdminAuth } from "../hooks/useAdminAuth";
import { getProducts } from "../api/client";

import {
  placeholderProducts,
  placeholderProductCategories,
} from "../data/placeholder";

import "./Products.css";


/* =========================================================
   CATEGORY LABEL
========================================================= */

const labelFor = (key) =>
  placeholderProductCategories.find(
    (c) => c.key === key
  )?.label ?? key;


/* =========================================================
   PRODUCTS PAGE
========================================================= */

export default function Products() {

  const { isAdmin } = useAdminAuth();

  const { categorySlug } = useParams();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();


  /* =========================================================
     STATE
  ========================================================= */

  const [products, setProducts] =
    useState(placeholderProducts);

  const category = categorySlug || "all";

  const [query, setQuery] =
    useState(searchParams.get("q") || "");

  const [showImport, setShowImport] =
    useState(false);

  const [homepageOnly, setHomepageOnly] =
    useState(false);


  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  const refreshProducts = () =>
    getProducts()
      .then((data) => {

        if (data.length) {
          setProducts(data);
        }

      })
      .catch(() => {
        setProducts(placeholderProducts);
      });


  useEffect(() => {
    refreshProducts();
  }, []);


  /* =========================================================
     SYNC SEARCH WITH NAVBAR
  ========================================================= */

  useEffect(() => {

    setQuery(
      searchParams.get("q") || ""
    );

  }, [searchParams]);


  /* =========================================================
     PRODUCT CATEGORIES
  ========================================================= */

  const categories = useMemo(() => {

    const counts = {};

    products.forEach((p) => {

      counts[p.category] =
        (counts[p.category] || 0) + 1;

    });


    return placeholderProductCategories
      .filter((c) => counts[c.key])
      .map((c) => ({
        ...c,
        count: counts[c.key],
      }));

  }, [products]);


  /* =========================================================
     FILTER PRODUCTS
  ========================================================= */

  const filtered = useMemo(() => {

    const q = query
      .trim()
      .toLowerCase();


    return products.filter((p) => {

      /* CATEGORY FILTER */

      if (
        category !== "all" &&
        p.category !== category
      ) {
        return false;
      }


      /* HOMEPAGE FILTER — ADMIN ONLY */

      if (
        homepageOnly &&
        !p.featured
      ) {
        return false;
      }


      /* SEARCH */

      if (!q) {
        return true;
      }


      return `${p.model} ${p.name} ${p.brand} ${p.category} ${
        p.category_label ?? ""
      }`
        .toLowerCase()
        .includes(q);

    });

  }, [
    products,
    category,
    query,
    homepageOnly,
  ]);


  /* =========================================================
     ACTIVE CATEGORY
  ========================================================= */

  const activeCategory =
    category !== "all"
      ? placeholderProductCategories.find(
          (c) => c.key === category
        )
      : null;


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>

      {/* =====================================================
          PAGE HERO
      ===================================================== */}

      <PageHero
        variant="products"
        crumb="Products"
        category={activeCategory?.key}
        eyebrow={
          activeCategory
            ? "Product Category"
            : "Product Marketplace"
        }

        title={
          activeCategory
            ? activeCategory.label
            : "Find the Exact Part by Model Number"
        }

        subtitle={
          activeCategory
            ? `Browse our ${activeCategory.label.toLowerCase()} range by model — then request a tailored price. No checkout, no card payment.`
            : "Search switches, servers, firewalls and networking parts by model — then request a tailored price. No checkout, no card payment."
        }
      />


      {/* =====================================================
          PRODUCTS SECTION
      ===================================================== */}

      <section className="section section-alt">

        <div className="container">


          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="products-toolbar">

            <div className="products-search">

              <FaSearch
                aria-hidden="true"
              />

              <input
                id="product-search"
                type="search"
                value={query}

                onChange={(e) =>
                  setQuery(e.target.value)
                }

                placeholder="Search by product name, model no. or category — e.g. Switch, C9200-24T-E, PowerEdge"

                aria-label="Search products by name, model number or category"

                autoComplete="off"
              />


              {query && (

                <button
                  type="button"
                  className="products-search__clear"

                  onClick={() =>
                    setQuery("")
                  }

                  aria-label="Clear search"
                >

                  <FaTimes />

                </button>

              )}

            </div>


            {/* =================================================
                ADMIN IMPORT
            ================================================= */}

            {isAdmin && (

              <button
                type="button"
                className="products-import-btn"

                onClick={() =>
                  setShowImport(true)
                }
              >

                <FaFileExcel />

                Import from Excel

              </button>

            )}

          </div>


          {/* =================================================
              ADMIN HOMEPAGE FILTER
          ================================================= */}

          {isAdmin && (

            <label className="products-homepage-filter">

              <input
                type="checkbox"
                checked={homepageOnly}

                onChange={(e) =>
                  setHomepageOnly(
                    e.target.checked
                  )
                }
              />

              Show only products marked
              &ldquo;Display on homepage&rdquo;

            </label>

          )}


          {/* =================================================
              CATEGORY FILTERS
          ================================================= */}

          <div
            className="products-filters"
            role="tablist"
            aria-label="Product categories"
          >

            {/* ALL PARTS */}

            <button
              type="button"

              className={`product-filter ${
                category === "all"
                  ? "product-filter--active"
                  : ""
              }`}

              onClick={() =>
                navigate("/products")
              }
            >

              All parts

            </button>


            {/* CATEGORIES */}

            {categories.map((c) => (

              <button
                type="button"
                key={c.key}

                className={`product-filter ${
                  category === c.key
                    ? "product-filter--active"
                    : ""
                }`}

                /*
                 * IMPORTANT:
                 *
                 * Correct category route:
                 *
                 * /products/category/:categorySlug
                 *
                 * Do NOT use:
                 * /products/:category
                 */

                onClick={() =>
                  navigate(
                    `/products/category/${c.key}`
                  )
                }
              >

                {c.label}

                <span className="product-filter__count">
                  {c.count}
                </span>

              </button>

            ))}

          </div>


          {/* =================================================
              PRODUCT COUNT
          ================================================= */}

          <p className="products-count">

            <strong>
              {filtered.length}
            </strong>{" "}

            {filtered.length === 1
              ? "part"
              : "parts"}

            {category !== "all"
              ? ` in ${labelFor(category)}`
              : ""}

            {query.trim()
              ? ` matching “${query.trim()}”`
              : ""}

          </p>


          {/* =================================================
              EMPTY STATE / PRODUCT GRID
          ================================================= */}

          {filtered.length === 0 ? (

            <div className="product-empty">

              <FaSearch
                aria-hidden="true"
              />

              <h3>
                No parts match that yet
              </h3>

              <p>
                We source far more than we list.
                Send the model number as a quote
                request and our team will track it
                down.
              </p>

              <Link
                to="/get-a-quote"
                className="btn btn-primary"
              >

                Request a Quote

                <FaArrowRight />

              </Link>

            </div>

          ) : (

            <div className="products-grid">

              {filtered.map((p) => (

                <ProductCard
                  product={p}

                  isAdmin={isAdmin}

                  key={
                    p.id ??
                    p._id ??
                    p.model
                  }


                  /* =========================================
                     PRODUCT UPDATED
                  ========================================= */

                  onUpdated={(updated) => {

                    setProducts((prev) =>
                      prev.map((item) =>
                        item.id === updated.id
                          ? updated
                          : item
                      )
                    );

                  }}


                  /* =========================================
                     PRODUCT DELETED
                  ========================================= */

                  onDeleted={(id) => {

                    setProducts((prev) =>
                      prev.filter(
                        (item) =>
                          item.id !== id
                      )
                    );

                  }}

                />

              ))}

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          IMPORT MODAL
      ===================================================== */}

      {showImport && (

        <ImportProductsModal
          onClose={() =>
            setShowImport(false)
          }

          onImported={
            refreshProducts
          }
        />

      )}


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="section how-strip">

        <div className="container">

          <span className="eyebrow">
            The process
          </span>

          <h2 className="section-heading">
            From model number to quote
          </h2>


          <div className="how-strip__grid">


            {/* =================================================
                STEP 1
            ================================================= */}

            <div className="how-strip__item">

              <FaCheckCircle />

              <div>

                <h3>
                  Search or ask
                </h3>

                <p>
                  Type the exact model, or send
                  us a list — no account needed
                  to enquire.
                </p>

              </div>

            </div>


            {/* =================================================
                STEP 2
            ================================================= */}

            <div className="how-strip__item">

              <FaCheckCircle />

              <div>

                <h3>
                  We price &amp; stock-check
                </h3>

                <p>
                  We confirm availability, lead
                  time and your best trade price
                  against quantity.
                </p>

              </div>

            </div>


            {/* =================================================
                STEP 3
            ================================================= */}

            <div className="how-strip__item">

              <FaCheckCircle />

              <div>

                <h3>
                  Quote in your inbox
                </h3>

                <p>
                  A formal quotation lands
                  within one business day —
                  usually within the hour.
                </p>

              </div>

            </div>


          </div>

        </div>

      </section>

    </>
  );
}
