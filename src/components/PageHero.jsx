import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaEnvelope,
  FaFileInvoice,
  FaGlobeEurope,
  FaHandshake,
  FaMapMarkerAlt,
  FaNetworkWired,
  FaPhoneAlt,
  FaServer,
  FaShieldAlt,
  FaTruck,
  FaUsers,
} from "react-icons/fa";
import { getHeroSlides, getProducts, getWhoWeAreImages } from "../api/client";
import { DEFAULT_APART_IMAGE, DEFAULT_CAPABILITY_IMAGES, DEFAULT_SLIDES } from "../data/contentDefaults";
import { placeholderProducts } from "../data/placeholder";
import { imageFor } from "../utils/productImage";
import "./PageHero.css";

const ROTATE_MS = 4200;
const MAX_IMAGES = 6;

const uniq = (list) => [...new Set(list.filter(Boolean))].slice(0, MAX_IMAGES);

const productImages = (products, category) => {
  const inCategory = category ? products.filter((p) => p.category === category) : products;
  // Real uploaded photos first, then the per-category stock shots.
  const withPhoto = (inCategory.length ? inCategory : products).slice().sort(
    (a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image))
  );
  return uniq(withPhoto.map(imageFor));
};

const slideImages = (slides) =>
  uniq(DEFAULT_SLIDES.map((def, i) => slides?.[i]?.image || def.image));

// Which database images fill the panel on each page. Every loader falls
// back to the site's built-in images if the API is unreachable.
const IMAGE_SOURCES = {
  products: (category) =>
    getProducts()
      .then((list) => productImages(list.length ? list : placeholderProducts, category))
      .catch(() => productImages(placeholderProducts, category)),
  quote: () =>
    getProducts()
      .then((list) => productImages(list.length ? list : placeholderProducts))
      .catch(() => productImages(placeholderProducts)),
  who: () =>
    getWhoWeAreImages()
      .then((d) =>
        uniq([
          d.apartImage || DEFAULT_APART_IMAGE,
          ...DEFAULT_CAPABILITY_IMAGES.map((def, i) => d.capabilityImages?.[i] || def),
        ])
      )
      .catch(() => uniq([DEFAULT_APART_IMAGE, ...DEFAULT_CAPABILITY_IMAGES])),
  contact: () =>
    getHeroSlides()
      .then((d) => slideImages(d.slides))
      .catch(() => slideImages()),
  about: () =>
    getHeroSlides()
      .then((d) => slideImages(d.slides))
      .catch(() => slideImages()),
};

// Loads the page's images and cycles through them.
function useRotatingImages(variant, category, disabled) {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState(() => new Set());

  useEffect(() => {
    if (disabled) return undefined;
    let alive = true;
    const load = IMAGE_SOURCES[variant] || IMAGE_SOURCES.about;
    load(category).then((list) => {
      if (!alive) return;
      setImages(list);
      setIndex(0);
    });
    return () => {
      alive = false;
    };
  }, [variant, category, disabled]);

  const usable = images.filter((src) => !broken.has(src));

  useEffect(() => {
    if (usable.length < 2) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % usable.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [usable.length]);

  const markBroken = (src) => setBroken((prev) => new Set(prev).add(src));
  return {
    current: usable.length ? usable[index % usable.length] : null,
    count: usable.length,
    index: usable.length ? index % usable.length : 0,
    markBroken,
  };
}

const EASE = [0.22, 1, 0.36, 1];

// What floats in the 3D scene on each page. `core` is the big icon on the
// centre panel (ignored when an image is passed); `cards` are the glass
// chips that hover in front of it at different depths.
const VISUALS = {
  about: {
    core: FaUsers,
    cards: [
      { icon: FaHandshake, title: "Your technology partner", sub: "Supply · support · integration" },
      { icon: FaShieldAlt, title: "Genuine hardware", sub: "New · sealed · refurbished" },
    ],
  },
  who: {
    core: FaGlobeEurope,
    cards: [
      { icon: FaMapMarkerAlt, title: "London based", sub: "UK team, always reachable" },
      { icon: FaServer, title: "Enterprise hardware", sub: "Switches · servers · storage" },
      { icon: FaNetworkWired, title: "Supply + integration", sub: "Sourced, configured, delivered" },
    ],
  },
  products: {
    core: FaServer,
    cards: [
      { icon: FaShieldAlt, title: "Genuine stock", sub: "New · sealed · refurbished" },
      { icon: FaTruck, title: "Worldwide delivery", sub: "Available · 3-5 days" },
      { icon: FaBoxOpen, title: "Multi-brand", sub: "Cisco · HPE · Dell · Juniper" },
    ],
  },
  contact: {
    core: FaEnvelope,
    cards: [
      { icon: FaPhoneAlt, title: "Call us", sub: "+44 7476 564673" },
      { icon: FaEnvelope, title: "Email us", sub: "info@alphaedgeitservices.co.uk" },
      { icon: FaClock, title: "Fast reply", sub: "Within one business day" },
    ],
  },
  quote: {
    core: FaFileInvoice,
    cards: [
      { icon: FaCheckCircle, title: "Free quote", sub: "No obligation" },
      { icon: FaClock, title: "Tailored pricing", sub: "Within one business day" },
      { icon: FaTruck, title: "Worldwide delivery", sub: "Available · 3-5 days" },
    ],
  },
};

// Depth (px, translateZ) and resting position for up to three cards.
const CARD_SLOTS = [
  { z: 90, className: "page-hero3d__card--1" },
  { z: 140, className: "page-hero3d__card--2" },
  { z: 70, className: "page-hero3d__card--3" },
];

const wordVariants = {
  hidden: { y: "110%" },
  show: (i) => ({ y: "0%", transition: { duration: 0.8, ease: EASE, delay: 0.15 + i * 0.06 } }),
};

export default function PageHero({ eyebrow, title, subtitle, image, variant = "about", crumb, category }) {
  const reduceMotion = useReducedMotion();
  // A fixed `image` prop wins; otherwise pull a rotating set from the database.
  const rotating = useRotatingImages(variant, category, Boolean(image));
  const panelImage = image || rotating.current;
  const sectionRef = useRef(null);
  const visual = VISUALS[variant] || VISUALS.about;
  const Core = visual.core;

  // Pointer position across the whole hero, -0.5 … 0.5, smoothed.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 70, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 70, damping: 18, mass: 0.6 });
  const rotY = useTransform(sx, [-0.5, 0.5], [-16, 16]);
  const rotX = useTransform(sy, [-0.5, 0.5], [12, -12]);
  const glowX = useTransform(sx, [-0.5, 0.5], ["20%", "80%"]);
  const glowY = useTransform(sy, [-0.5, 0.5], ["15%", "85%"]);

  const onMove = (e) => {
    if (reduceMotion || !sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  const words = String(title || "").split(" ");
  const pageLabel = crumb || (typeof eyebrow === "string" ? eyebrow : "");

  return (
    <section
      ref={sectionRef}
      className="page-hero3d"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* ---------- background: orbs, perspective grid floor, glow ---------- */}
      <div className="page-hero3d__bg" aria-hidden="true">
        <span className="page-hero3d__orb page-hero3d__orb--a" />
        <span className="page-hero3d__orb page-hero3d__orb--b" />
        <div className="page-hero3d__floor" />
        <motion.div
          className="page-hero3d__spot"
          style={{ "--gx": glowX, "--gy": glowY }}
        />
      </div>

      <div className="container page-hero3d__inner">
        {/* ---------- copy ---------- */}
        <div className="page-hero3d__copy">
          {pageLabel && (
            <motion.nav
              className="page-hero3d__crumbs"
              aria-label="Breadcrumb"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <Link to="/">Home</Link>
              <FaChevronRight aria-hidden="true" />
              <span>{pageLabel}</span>
            </motion.nav>
          )}

          {eyebrow && (
            <motion.span
              className="page-hero3d__eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
            >
              <span className="page-hero3d__pulse" aria-hidden="true" />
              {eyebrow}
            </motion.span>
          )}

          <h1 className="page-hero3d__title" aria-label={title}>
            {words.map((w, i) => (
              <Fragment key={`${w}-${i}`}>
                <span className="page-hero3d__word-mask" aria-hidden="true">
                  <motion.span
                    className={`page-hero3d__word ${i === words.length - 1 ? "page-hero3d__word--accent" : ""}`}
                    variants={wordVariants}
                    initial={reduceMotion ? false : "hidden"}
                    animate="show"
                    custom={i}
                  >
                    {w}
                  </motion.span>
                </span>
                {i < words.length - 1 && " "}
              </Fragment>
            ))}
          </h1>

          {subtitle && (
            <motion.p
              className="page-hero3d__sub"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.35 + words.length * 0.04 }}
            >
              {subtitle}
            </motion.p>
          )}

          <motion.span
            className="page-hero3d__rule"
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
          />
        </div>

        {/* ---------- 3D scene ---------- */}
        <div className="page-hero3d__stage" aria-hidden="true">
          {/* outer layer: one-off entrance swing; inner layer: pointer tilt */}
          <motion.div
            className="page-hero3d__scene-in"
            initial={reduceMotion ? false : { opacity: 0, rotateX: 22, rotateY: -28, scale: 0.9 }}
            animate={{ opacity: 1, rotateX: 0, rotateY: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
          >
          <motion.div
            className="page-hero3d__scene"
            style={reduceMotion ? undefined : { rotateX: rotX, rotateY: rotY }}
          >
            {/* back plate */}
            <div className="page-hero3d__plate page-hero3d__plate--back" />

            {/* main panel: image, or the page's icon */}
            <div className={`page-hero3d__plate page-hero3d__plate--main ${panelImage ? "has-image" : ""}`}>
              {panelImage ? (
                <>
                  <AnimatePresence initial={false}>
                    <motion.img
                      key={panelImage}
                      src={panelImage}
                      alt=""
                      loading="eager"
                      initial={{ opacity: 0, scale: 1.08 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ opacity: { duration: 0.9 }, scale: { duration: ROTATE_MS / 1000, ease: "linear" } }}
                      onError={() => !image && rotating.markBroken(panelImage)}
                    />
                  </AnimatePresence>
                  <span className="page-hero3d__img-shade" />
                  {!image && rotating.count > 1 && (
                    <span className="page-hero3d__dots">
                      {Array.from({ length: rotating.count }, (_, i) => (
                        <span key={i} className={i === rotating.index ? "is-active" : ""} />
                      ))}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="page-hero3d__rings">
                    <span />
                    <span />
                    <span />
                  </div>
                  <motion.div
                    className="page-hero3d__core"
                    animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Core />
                  </motion.div>
                </>
              )}
              <span className="page-hero3d__sheen" />
            </div>

            {/* floating glass cards at different depths */}
            {visual.cards.slice(0, 3).map((c, i) => {
              const slot = CARD_SLOTS[i];
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className={`page-hero3d__card-wrap ${slot.className}`}
                  style={{ transform: `translateZ(${slot.z}px)` }}
                >
                  <motion.div
                    className="page-hero3d__card"
                    initial={{ opacity: 0, y: 24 }}
                    animate={
                      reduceMotion
                        ? { opacity: 1, y: 0 }
                        : { opacity: 1, y: [0, -8, 0] }
                    }
                    transition={{
                      opacity: { duration: 0.6, delay: 0.6 + i * 0.15 },
                      y: reduceMotion
                        ? { duration: 0.6, delay: 0.6 + i * 0.15 }
                        : { duration: 4.5 + i, repeat: Infinity, ease: "easeInOut", delay: 0.6 + i * 0.15 },
                    }}
                  >
                    <span className="page-hero3d__card-icon">
                      <Icon />
                    </span>
                    <span className="page-hero3d__card-text">
                      <strong>{c.title}</strong>
                      <small>{c.sub}</small>
                    </span>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
