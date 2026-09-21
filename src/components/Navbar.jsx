import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaSignOutAlt,
  FaTachometerAlt,
  FaChevronDown,
} from "react-icons/fa";

import { useAdminAuth } from "../hooks/useAdminAuth";
import { placeholderProductCategories } from "../data/placeholder";
import logo from "../assets/Alpha_Edge_logos.jpg";

import "./Navbar.css";


// "Services" has been replaced by "Products", which keeps the hardware
// category dropdown that used to hang off Services. The separate Products
// link that sat beside it is gone — the two are now one item.
const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/who-we-are", label: "Who We Are" },
  { to: "/products", label: "Products", dropdown: true },
  { to: "/contact", label: "Contact" },
];


export default function Navbar() {

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [query, setQuery] = useState("");

  const navigate = useNavigate();

  const { isAdmin, logout } = useAdminAuth();

  const servicesRef = useRef(null);


  /* =========================================================
     SCROLL
  ========================================================= */

  useEffect(() => {

    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };

  }, []);


  /* =========================================================
     OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {

    if (!servicesOpen) return;

    const onDocClick = (e) => {

      if (
        servicesRef.current &&
        !servicesRef.current.contains(e.target)
      ) {
        setServicesOpen(false);
      }

    };

    document.addEventListener(
      "mousedown",
      onDocClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        onDocClick
      );
    };

  }, [servicesOpen]);


  /* =========================================================
     CLOSE MENUS
  ========================================================= */

  const closeMenus = () => {
    setOpen(false);
    setServicesOpen(false);
  };


  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = (e) => {

    e.preventDefault();

    const q = query.trim();

    navigate(
      q
        ? `/products?q=${encodeURIComponent(q)}`
        : "/products"
    );

    closeMenus();

  };


  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = async () => {

    await logout();

    closeMenus();

    navigate("/");

  };


  return (

    <header
      className={`navbar ${
        scrolled ? "navbar--scrolled" : ""
      }`}
    >

      <div className="container navbar__inner">


        {/* =================================================
            LOGO
        ================================================= */}

        <NavLink
          to="/"
          className="navbar__brand"
          onClick={closeMenus}
        >
          <img
            src={logo}
            alt="Alpha Edge IT Services Ltd"
          />
        </NavLink>


        {/* =================================================
            SEARCH
        ================================================= */}

        <form
          className="navbar__search"
          onSubmit={handleSearch}
          role="search"
        >

          <FaSearch aria-hidden="true" />

          <input
            type="search"
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search by product name, model no. or category…"
            aria-label="Search products by name, model number or category"
          />

        </form>


        {/* =================================================
            MOBILE MENU BUTTON
        ================================================= */}

        <button
          className={`navbar__toggle ${
            open
              ? "navbar__toggle--open"
              : ""
          }`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() =>
            setOpen((v) => !v)
          }
        >

          <span />
          <span />
          <span />

        </button>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav
          className={`navbar__links ${
            open
              ? "navbar__links--open"
              : ""
          }`}
        >

          {links.map((l) =>

            l.dropdown ? (

              /* =================================================
                 SERVICES DROPDOWN
              ================================================= */

              <div
                key={l.to}
                ref={servicesRef}
                className={`navbar__item navbar__item--dropdown ${
                  servicesOpen
                    ? "navbar__item--open"
                    : ""
                }`}
              >

                <span className="navbar__link-row">

                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      `navbar__link ${
                        isActive
                          ? "navbar__link--active"
                          : ""
                      }`
                    }
                    onClick={closeMenus}
                  >
                    {l.label}
                  </NavLink>


                  <button
                    type="button"
                    className={`navbar__dropdown-toggle ${
                      servicesOpen
                        ? "navbar__dropdown-toggle--open"
                        : ""
                    }`}
                    aria-label="Toggle product categories"
                    aria-expanded={servicesOpen}
                    onClick={() =>
                      setServicesOpen(
                        (v) => !v
                      )
                    }
                  >

                    <FaChevronDown
                      aria-hidden="true"
                    />

                  </button>

                </span>


                {/* =================================================
                    SERVICES / CATEGORY DROPDOWN
                ================================================= */}

                <div
                  className="navbar__dropdown"
                  role="menu"
                >

                  {placeholderProductCategories.map(
                    (c) => (

                      <Link
                        key={c.key}

                        /*
                         * FIX:
                         *
                         * Previously:
                         * /products/:category
                         *
                         * React was treating that as
                         * ProductDetails.
                         *
                         * Correct category route:
                         * /products/category/:categorySlug
                         */
                        to={`/products/category/${c.key}`}

                        className="navbar__dropdown-link"

                        role="menuitem"

                        onClick={closeMenus}
                      >
                        {c.label}
                      </Link>

                    )
                  )}

                </div>

              </div>

            ) : (

              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `navbar__link ${
                    isActive
                      ? "navbar__link--active"
                      : ""
                  }`
                }
                onClick={closeMenus}
              >
                {l.label}
              </NavLink>

            )

          )}


          {/* =================================================
              GET A QUOTE
          ================================================= */}

          <NavLink
            to="/get-a-quote"
            className="btn btn-accent navbar__cta"
            onClick={closeMenus}
          >
            Get a Quote
          </NavLink>


          {/* =================================================
              ADMIN
          ================================================= */}

          {isAdmin && (

            <>

              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `navbar__link ${
                    isActive
                      ? "navbar__link--active"
                      : ""
                  }`
                }
                onClick={closeMenus}
              >
                {/* <FaTachometerAlt /> Dashboard */}
              </NavLink>


              <button
                type="button"
                className="navbar__auth-btn"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                Log Out
              </button>

            </>

          )}

        </nav>

      </div>

    </header>

  );

}
