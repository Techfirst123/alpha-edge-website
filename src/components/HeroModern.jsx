import { useEffect, useRef, useState } from "react";
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
  FaArrowRight,
  FaCheckCircle,
  FaShieldAlt,
  FaGlobeEurope,
  FaHeadset,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { getHeroSlides, adminUpdateHeroSlide } from "../api/client";
import { DEFAULT_SLIDES } from "../data/contentDefaults";
import { useAdminAuth } from "../hooks/useAdminAuth";
import EditIconButton from "./EditIconButton";
import EditModal from "./EditModal";
import "./HeroModern.css";

// How long each slide stays up. Drives the CSS progress bar, which in turn
// advances the slide when it finishes — so pausing the bar pauses autoplay.
const SLIDE_MS = 6500;

// Vendor strip along the bottom of the hero. File names match /public/brands.
const MARQUEE_BRANDS = [
  "cisco", "hpe", "aruba", "dell", "lenovo", "juniper",
  "fortinet", "palo-alto", "huawei", "vmware", "arista", "emc",
];

// Same merge rule as the old slider: any slide or field an admin hasn't
// edited yet falls back to the built-in default.
function mergeSlides(fetchedSlides) {
  return DEFAULT_SLIDES.map((def, i) => {
    const fetched = fetchedSlides?.[i];
    if (!fetched) return def;
    return {
      eyebrow: fetched.eyebrow || def.eyebrow,
      heading: fetched.heading || def.heading,
      subtitle: fetched.subtitle || def.subtitle,
      image: fetched.image || def.image,
    };
  });
}

const EASE = [0.22, 1, 0.36, 1];

const wordVariants = {
  hidden: { y: "110%" },
  show: (i) => ({
    y: "0%",
    transition: { delay: 0.1 + i * 0.06, duration: 0.75, ease: EASE },
  }),
};

const FEATURE_CARDS = [
  { icon: FaShieldAlt, title: "Genuine stock", sub: "New · sealed · refurbished", depth: 26 },
  { icon: FaGlobeEurope, title: "Worldwide delivery", sub: "Available · 3-5 days", depth: 38 },
  { icon: FaHeadset, title: "Expert support", sub: "Before · during · after", depth: 18 },
];

export default function HeroModern({ ctaText = "Get a Free Consultation", ctaLink = "/contact" }) {
  const { isAdmin } = useAdminAuth();
  const reduceMotion = useReducedMotion();
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [brokenImages, setBrokenImages] = useState(() => new Set());
  const sectionRef = useRef(null);

  useEffect(() => {
    getHeroSlides()
      .then((d) => setSlides(mergeSlides(d.slides)))
      .catch(() => setSlides(DEFAULT_SLIDES));
  }, []);

  const goTo = (i) => setCurrent((i + slides.length) % slides.length);
  const goNext = () => goTo(current + 1);
  const goPrev = () => goTo(current - 1);

  // Autoplay stops while the pointer rests on the feature cards / controls,
  // while an admin is editing, and entirely for reduced-motion users.
  const paused = hovered || editingIndex !== null || reduceMotion;

  // --- Pointer parallax across the whole hero ------------------------------
  const px = useMotionValue(0); // -0.5 .. 0.5
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 80, damping: 20, mass: 0.5 });
  const sy = useSpring(py, { stiffness: 80, damping: 20, mass: 0.5 });
  // Background drifts gently opposite the pointer; foreground cards drift more.
  const spotX = useTransform(sx, [-0.5, 0.5], ["15%", "85%"]);
  const spotY = useTransform(sy, [-0.5, 0.5], ["10%", "90%"]);

  const handleMove = (e) => {
    if (reduceMotion || !sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const resetPointer = () => {
    px.set(0);
    py.set(0);
  };

  const active = slides[current];
  const words = active.heading.split(" ");
  const imageOk = active.image && !brokenImages.has(active.image);
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      className={`hm ${isAdmin ? "editable-hover-target" : ""}`}
      onMouseMove={handleMove}
      onMouseLeave={resetPointer}
    >
      {/* ---------- full-bleed background slides ---------- */}
      {/* Each slide is shown whole (object-fit: contain) so nothing is cropped
          at the edges; a blurred copy of the same image fills any leftover
          space behind it. No parallax or overscale on the image itself. */}
      <div className="hm__bg" aria-hidden="true">
        <AnimatePresence initial={false}>
          {imageOk ? (
            <motion.div
              key={active.image}
              className="hm__slide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            >
              <img src={active.image} alt="" className="hm__bg-blur" />
              <motion.img
                src={active.image}
                alt=""
                className="hm__bg-img"
                // Gentle settle-in that finishes at exactly 100% scale, so the
                // full image is always inside the frame once it lands.
                initial={{ scale: reduceMotion ? 1 : 1.04 }}
                animate={{ scale: 1 }}
                transition={{ duration: reduceMotion ? 0 : 2.4, ease: EASE }}
                onError={() => setBrokenImages((s) => new Set(s).add(active.image))}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`fallback-${current}`}
              className="hm__slide hm__bg-img--fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* readability shading + texture + pointer spotlight */}
      <div className="hm__shade" aria-hidden="true" />
      <div className="hm__grid" aria-hidden="true" />
      {!reduceMotion && (
        <motion.div
          className="hm__spot"
          style={{ "--sx": spotX, "--sy": spotY }}
          aria-hidden="true"
        />
      )}

      {isAdmin && (
        <EditIconButton onClick={() => setEditingIndex(current)} label={`Edit slide ${current + 1}`} />
      )}

      <div className="container hm__inner">
        {/* ---------- copy ---------- */}
        <div className="hm__copy">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}
            >
              <motion.span
                className="hm__eyebrow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="hm__pulse" aria-hidden="true" />
                {active.eyebrow}
              </motion.span>

              <h1 className="hm__title" aria-label={active.heading}>
                {words.map((w, i) => (
                  <span className="hm__word-mask" key={`${w}-${i}`} aria-hidden="true">
                    <motion.span
                      className={`hm__word ${i === words.length - 1 ? "hm__word--accent" : ""}`}
                      custom={i}
                      variants={wordVariants}
                      initial={reduceMotion ? "show" : "hidden"}
                      animate="show"
                    >
                      {w}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.p
                className="hm__sub"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {active.subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="hm__actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to={ctaLink || "/contact"} className="hm__btn hm__btn--primary">
                <span>{ctaText}</span>
                <FaArrowRight />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to="/products" className="hm__btn hm__btn--ghost">
                Browse Products
              </Link>
            </motion.div>
          </motion.div>

          <motion.ul
            className="hm__checks"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.7 } } }}
          >
            {["Certified engineers", "24/7 monitoring", "UK-based support"].map((t) => (
              <motion.li
                key={t}
                variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
              >
                <FaCheckCircle /> {t}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* ---------- floating feature cards ---------- */}
        <div
          className="hm__features"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {FEATURE_CARDS.map((c, i) => (
            <FeatureCard key={c.title} card={c} index={i} sx={sx} sy={sy} reduceMotion={reduceMotion} />
          ))}
        </div>
      </div>

      {/* ---------- slide controls ---------- */}
      <div
        className="container hm__controls"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="hm__counter" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.strong
              key={current}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {pad(current + 1)}
            </motion.strong>
          </AnimatePresence>
          <em>/ {pad(slides.length)}</em>
        </span>

        <div className="hm__progress">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className="hm__seg"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current}
            >
              <span
                key={i === current ? `run-${current}` : `idle-${i}`}
                className={`hm__seg-fill ${i < current ? "is-done" : ""} ${i === current ? "is-active" : ""}`}
                style={{
                  animationDuration: `${SLIDE_MS}ms`,
                  animationPlayState: paused ? "paused" : "running",
                }}
                // The fill and its ::after both animate; only the fill's own
                // timer should advance, or one tick would skip two slides.
                onAnimationEnd={
                  i === current
                    ? (e) => e.animationName === "hm-seg-timer" && goNext()
                    : undefined
                }
              />
            </button>
          ))}
        </div>

        <div className="hm__arrows">
          <button type="button" className="hm__arrow" onClick={goPrev} aria-label="Previous slide">
            <FaChevronLeft />
          </button>
          <button type="button" className="hm__arrow" onClick={goNext} aria-label="Next slide">
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* ---------- vendor marquee ---------- */}
      <div className="hm__marquee" aria-label="Brands we supply">
        <div className={`hm__marquee-track ${reduceMotion ? "is-static" : ""}`}>
          {[...MARQUEE_BRANDS, ...MARQUEE_BRANDS].map((b, i) => (
            <img
              key={`${b}-${i}`}
              src={`/brands/${b}.svg`}
              alt={i < MARQUEE_BRANDS.length ? b : ""}
              aria-hidden={i >= MARQUEE_BRANDS.length}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ))}
        </div>
      </div>

      {editingIndex !== null && (
        <EditModal
          folder="hero"
          title={`Edit Slide ${editingIndex + 1}`}
          fields={[
            { name: "image", label: "Image", type: "image" },
            { name: "eyebrow", label: "Eyebrow", type: "text", maxLength: 120 },
            { name: "heading", label: "Heading", type: "text", maxLength: 160 },
            { name: "subtitle", label: "Subtitle", type: "textarea", maxLength: 300 },
          ]}
          initialValues={slides[editingIndex]}
          onClose={() => setEditingIndex(null)}
          onSave={async (values) => {
            const index = editingIndex;
            await adminUpdateHeroSlide({ index, ...values });
            setSlides((list) => list.map((s, i) => (i === index ? { ...s, ...values } : s)));
            setCurrent(index);
          }}
        />
      )}
    </section>
  );
}

function FeatureCard({ card, index, sx, sy, reduceMotion }) {
  const Icon = card.icon;
  // Each card drifts with the pointer by its own depth, so the layers
  // separate slightly as you move — a light parallax.
  const x = useTransform(sx, [-0.5, 0.5], [card.depth, -card.depth]);
  const y = useTransform(sy, [-0.5, 0.5], [card.depth * 0.5, -card.depth * 0.5]);

  return (
    // Three layers so each motion owns its own transform: pointer parallax
    // (outer), one-off entrance (middle), idle bob (inner).
    <motion.div
      className={`hm__float hm__float--${index}`}
      style={reduceMotion ? undefined : { x, y }}
    >
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 + index * 0.15, duration: 0.7, ease: EASE }}
      >
        <motion.div
          className="hm__float-inner"
          animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 4 + index, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="hm__float-icon"><Icon /></span>
          <span className="hm__float-text">
            <strong>{card.title}</strong>
            <small>{card.sub}</small>
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
