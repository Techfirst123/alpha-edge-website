import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaNetworkWired,
  FaServer,
  FaHdd,
  FaSitemap,
  FaPlug,
  FaStream,
  FaPen,
} from "react-icons/fa";

import {
  adminUpdateProduct,
  adminDeleteProduct,
} from "../api/client";

import { imageFor } from "../utils/productImage";
import EditModal from "./EditModal";

import "./ProductCard.css";


const CATEGORY_ICONS = {
  switch: FaNetworkWired,
  router: FaStream,
  server: FaServer,
  storage: FaHdd,
  hub: FaSitemap,
  optic: FaPlug,
};


const STOCK_OPTIONS = [
  { value: "in", label: "In stock" },
  { value: "order", label: "On order" },
];


export default function ProductCard({
  product,
  isAdmin,
  onUpdated,
  onDeleted,
}) {

  const [editing, setEditing] = useState(false);

  const navigate = useNavigate();

  const Icon =
    CATEGORY_ICONS[product.category] ||
    FaNetworkWired;

  const image = imageFor(product);


  /* =========================================================
     PRODUCT DETAILS URL
  ========================================================= */

  const productId =
    product._id ?? product.id;

  const productDetailsHref =
    `/products/${productId}`;


  /* =========================================================
     QUOTE URL
  ========================================================= */

  const quoteHref =
    `/get-a-quote?model=${encodeURIComponent(
      product.model
    )}&product=${encodeURIComponent(
      product.name
    )}`;


  /* =========================================================
     OPEN PRODUCT DETAILS
     
     Whole card is clickable.
     
     Buttons/interactive elements stop propagation so their
     own functions continue to work.
  ========================================================= */

  const openProductDetails = () => {
    navigate(productDetailsHref);
  };


  /* =========================================================
     KEYBOARD ACCESSIBILITY
  ========================================================= */

  const handleCardKeyDown = (e) => {

    if (
      e.key === "Enter" ||
      e.key === " "
    ) {

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


      {/* =====================================================
          PRODUCT IMAGE
      ===================================================== */}

      <div className="product-card__media">

        {image ? (

          <img
            className="product-card__img"
            src={image}
            alt={
              product.category_label ||
              product.category
            }
            loading="lazy"
          />

        ) : (

          <Icon
            className="product-card__glyph"
            aria-hidden="true"
          />

        )}


        <span className="product-card__brand">
          {product.brand}
        </span>


        <span
          className={`product-stock product-stock--${product.stock}`}
        >

          <i />

          {product.stock === "in"
            ? "In stock"
            : "On order"}

        </span>

      </div>


      {/* =====================================================
          PRODUCT BODY
      ===================================================== */}

      <div className="product-card__body">


        <span className="product-card__category">
          {product.category_label ||
            product.category}
        </span>


        {/* =================================================
            PRODUCT NAME
        ================================================= */}

        <h3>
          {product.name}
        </h3>


        <span className="product-card__model">
          {product.model}
        </span>


        <p className="product-card__desc">
          {product.short_description}
        </p>


        {/* =================================================
            ADMIN
        ================================================= */}

        {isAdmin ? (

          <div className="product-card__foot product-card__foot--admin">

            <button
              type="button"
              className="btn btn-dark product-card__edit-btn"

              onClick={(e) => {

                /*
                 * IMPORTANT:
                 * Prevent the card click from opening
                 * Product Details.
                 */

                e.stopPropagation();

                setEditing(true);

              }}
            >

              <FaPen />

              Edit Product

            </button>

          </div>

        ) : (

          /* =================================================
             PUBLIC
          ================================================= */

          <div className="product-card__foot">

            <span className="product-card__price">

              <small>
                PRICE
              </small>

              <strong>
                On request
              </strong>

            </span>


            <button
              type="button"
              className="btn btn-primary product-card__cta"

              onClick={(e) => {

                /*
                 * IMPORTANT:
                 * Prevent the card click.
                 * Only Request Price action runs.
                 */

                e.stopPropagation();

                navigate(quoteHref);

              }}
            >

              Request Price

              <FaArrowRight />

            </button>

          </div>

        )}

      </div>


      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editing && (

        <div
          onClick={(e) =>
            e.stopPropagation()
          }
        >

          <EditModal

            title={`Edit ${product.name}`}

            fields={[

              {
                name: "image",
                label: "Photo",
                type: "image",
              },

              {
                name: "name",
                label: "Product Name",
                type: "text",
                maxLength: 160,
              },

              {
                name: "model",
                label: "Model No.",
                type: "text",
                maxLength: 80,
              },

              {
                name: "brand",
                label: "Brand",
                type: "text",
                maxLength: 80,
              },

              {
                name: "category_label",
                label: "Category Label",
                type: "text",
                maxLength: 80,
              },

              {
                name: "short_description",
                label: "Short Description",
                type: "textarea",
                maxLength: 300,
              },

              {
                name: "stock",
                label: "Availability",
                type: "select",
                options: STOCK_OPTIONS,
              },

              {
                name: "featured",
                label: "Display on homepage (max 10)",
                type: "checkbox",
              },

            ]}


            initialValues={{

              image:
                product.image || "",

              name:
                product.name || "",

              model:
                product.model || "",

              brand:
                product.brand || "",

              category_label:
                product.category_label || "",

              short_description:
                product.short_description || "",

              stock:
                product.stock === "order"
                  ? "order"
                  : "in",

              featured:
                Boolean(product.featured),

            }}


            onClose={() =>
              setEditing(false)
            }


            onSave={async (values) => {

              await adminUpdateProduct({
                id: product.id,
                ...values,
              });


              onUpdated?.({
                ...product,
                ...values,
              });

            }}


            onDelete={async () => {

              await adminDeleteProduct(
                product.id
              );

              onDeleted?.(
                product.id
              );

            }}

          />

        </div>

      )}

    </article>

  );

}
