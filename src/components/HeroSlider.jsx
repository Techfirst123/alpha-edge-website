import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getHeroSlides, adminUpdateHeroSlide } from "../api/client";
import { DEFAULT_SLIDES } from "../data/contentDefaults";
import { useAdminAuth } from "../hooks/useAdminAuth";
import EditIconButton from "./EditIconButton";
import EditModal from "./EditModal";
import "./HeroSlider.css";

// Fills in any slide (or field) an admin hasn't edited yet with the default.
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

const AUTOPLAY_MS = 3000;
const FLIP_MS = 1000; // must match the .hero-slider__shot--active flip duration in HeroSlider.css
const TYPE_SPEED_MS = 32;

export default function HeroSlider({ ctaText = "Get a Free Consultation", ctaLink = "/contact" }) {
  const { isAdmin } = useAdminAuth();
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [typedHeading, setTypedHeading] = useState("");
  // The slide the edit modal is working on. Held separately from `current` so
  // the carousel can never move the target out from under an in-flight save.
  const [editingIndex, setEditingIndex] = useState(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    getHeroSlides()
      .then((d) => setSlides(mergeSlides(d.slides)))
      .catch(() => setSlides(DEFAULT_SLIDES));
  }, []);

  const goTo = (index) => {
    const next = (index + slides.length) % slides.length;
    setPrev(current);
    setCurrent(next);
  };
  const goPrev = () => goTo(current - 1);
  const goNext = () => goTo(current + 1);

  // Autoplay holds still while an admin is working: whenever the edit modal
  // is open, and whenever the cursor is over the media column. Hovering that
  // column is what reveals the edit pencil, so without the pause the slide
  // you aimed at has already rotated away by the time you reach the button.
  const autoplayPaused = editingIndex !== null || (isAdmin && hovered);

  useEffect(() => {
    if (autoplayPaused) return undefined;
    const timer = setTimeout(goNext, AUTOPLAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, autoplayPaused]);

  const active = slides[current];

  // Type the heading out one character at a time, starting only once the
  // image flip has finished (so the flip always reads as the "first beat").
  useEffect(() => {
    const heading = active.heading;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setTypedHeading(heading);
      return undefined;
    }

    setTypedHeading("");
    let count = 0;
    let intervalId;

    const startDelay = setTimeout(() => {
      intervalId = setInterval(() => {
        count += 1;
        setTypedHeading(heading.slice(0, count));
        if (count >= heading.length) clearInterval(intervalId);
      }, TYPE_SPEED_MS);
    }, FLIP_MS);

    return () => {
      clearTimeout(startDelay);
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const headingDone = typedHeading.length >= active.heading.length;

  const editingSlide = editingIndex === null ? null : slides[editingIndex];
  const adminPause = isAdmin
    ? { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }
    : {};

  return (
    <section className="hero-slider">
      <div className="hero-slider__glow hero-slider__glow--a" aria-hidden="true" />
      <div className="hero-slider__glow hero-slider__glow--b" aria-hidden="true" />

      <div className="container hero-slider__inner">
        <div className="hero-slider__copy" key={current} style={{ animationDelay: `${FLIP_MS}ms` }}>
          <span className="eyebrow eyebrow--light">{active.eyebrow}</span>
          <h1 aria-label={active.heading}>
            <span aria-hidden="true">{typedHeading}</span>
            {!headingDone && <span className="hero-slider__caret" aria-hidden="true" />}
          </h1>
          <p className="hero-slider__sub">{active.subtitle}</p>
          <div className="hero-slider__actions">
            <Link to={ctaLink || "/contact"} className="btn btn-primary">
              {ctaText} <FaArrowRight />
            </Link>
            <Link to="/services" className="btn btn-outline">
              Explore Services
            </Link>
          </div>
          <ul className="hero-slider__checks">
            <li><FaCheckCircle /> Certified engineers</li>
            <li><FaCheckCircle /> 24/7 monitoring</li>
            <li><FaCheckCircle /> UK-based support</li>
          </ul>
        </div>

        {/* The admin affordance lives on this column rather than the whole
            section: hovering here is both what reveals the pencil and what
            holds autoplay still, so the two always agree. Scoping it here
            also means an admin reading the copy doesn't freeze the carousel. */}
        <div
          className={`hero-slider__media ${isAdmin ? "editable-hover-target" : ""}`}
          {...adminPause}
        >
          {isAdmin && (
            <EditIconButton
              onClick={() => setEditingIndex(current)}
              label={`Edit slide ${current + 1}`}
            />
          )}

          {/* Decorative: every slide's wording already sits in the copy
              column, so the frame is hidden from assistive tech. The controls
              below it are not, and stay outside this element. */}
          <div className="hero-slider__frame" aria-hidden="true">
            {slides.map((s, i) => {
              const isActive = i === current;
              const isPrev = i === prev && !isActive;
              return (
                <img
                  key={`${i}-${s.image}`}
                  src={s.image}
                  alt=""
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className={`hero-slider__shot ${isActive ? "hero-slider__shot--active" : ""} ${isPrev ? "hero-slider__shot--prev" : ""}`}
                />
              );
            })}
          </div>

          <div className="hero-slider__controls">
            <button
              type="button"
              className="hero-slider__arrow"
              onClick={goPrev}
              aria-label="Previous slide"
            >
              <FaChevronLeft />
            </button>

            <div className="hero-slider__dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`hero-slider__dot ${i === current ? "hero-slider__dot--active" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="hero-slider__arrow"
              onClick={goNext}
              aria-label="Next slide"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {editingSlide && (
        <EditModal
          folder="hero"
          title={`Edit Slide ${editingIndex + 1}`}
          fields={[
            { name: "image", label: "Image", type: "image" },
            { name: "eyebrow", label: "Eyebrow", type: "text", maxLength: 120 },
            { name: "heading", label: "Heading", type: "text", maxLength: 160 },
            { name: "subtitle", label: "Subtitle", type: "textarea", maxLength: 300 },
          ]}
          initialValues={editingSlide}
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
