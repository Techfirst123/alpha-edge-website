import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import sourcingImg from "../assets/whoweare/sourcing.webp";
import buildImg from "../assets/whoweare/build-configure.webp";
import verifiedImg from "../assets/whoweare/verified.webp";
import supportImg from "../assets/whoweare/support.webp";
import "./AboutTeaserCarousel.css";

const SLIDES = [
  {
    n: "01",
    tag: "Sourcing",
    img: sourcingImg,
    title: "Multi-brand hardware, sourced right",
    text: "Cisco, HPE Aruba, Dell, Fortinet and more — new or certified refurbished, matched to your spec and budget.",
  },
  {
    n: "02",
    tag: "Build",
    img: buildImg,
    title: "Racked and configured in-house",
    text: "Every unit is unboxed, mounted and configured in our own workshop before it ever ships.",
  },
  {
    n: "03",
    tag: "Verify",
    img: verifiedImg,
    title: "Serial-checked and stress-tested",
    text: "Powered up, diagnostics run and serial-logged against the order — proven, not just repackaged.",
  },
  {
    n: "04",
    tag: "Support",
    img: supportImg,
    title: "Backed long after the invoice",
    text: "Warranty handling, RMA turnaround and hands-on engineering support stay with you past go-live.",
  },
];

const AUTOPLAY_MS = 4500;

export default function AboutTeaserCarousel({ heading, text }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);

  const goTo = useCallback((i) => {
    setDir(i > index || (index === SLIDES.length - 1 && i === 0) ? 1 : -1);
    setIndex((i + SLIDES.length) % SLIDES.length);
  }, [index]);

  const timerRef = useRef(null);
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setDir(1);
      setIndex((cur) => (cur + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  const slide = SLIDES[index];

  return (
    <section className="section section-alt about-teaser">
      <div className="container atc-grid">
        <div
          className="atc-visual"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="atc-frame">
            <div className="atc-frame__zoom">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.img
                  key={slide.n}
                  src={slide.img}
                  alt={slide.title}
                  className="atc-frame__img"
                  initial={{ opacity: 0, x: dir > 0 ? 60 : -60, scale: 1.03 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: dir > 0 ? -60 : 60, scale: 1.03 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </AnimatePresence>
            </div>
            <div className="atc-frame__scrim" aria-hidden="true" />
            <span className="atc-frame__badge">{slide.n} / 0{SLIDES.length}</span>

            <button
              type="button"
              className="atc-arrow atc-arrow--prev"
              aria-label="Previous"
              onClick={() => goTo(index - 1)}
            >
              <FaChevronLeft />
            </button>
            <button
              type="button"
              className="atc-arrow atc-arrow--next"
              aria-label="Next"
              onClick={() => goTo(index + 1)}
            >
              <FaChevronRight />
            </button>
          </div>

          <div className="atc-dots" role="tablist" aria-label="Showcase slides">
            {SLIDES.map((s, i) => (
              <button
                key={s.n}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={s.tag}
                className={`atc-dot ${i === index ? "is-active" : ""}`}
                onClick={() => goTo(i)}
              >
                <span className="atc-dot__track">
                  {i === index && (
                    <span
                      className="atc-dot__fill"
                      style={{ animationPlayState: paused ? "paused" : "running", animationDuration: `${AUTOPLAY_MS}ms` }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="atc-content">
          <span className="eyebrow">Who We Are</span>
          <h2 className="section-heading">{heading}</h2>
          <p className="section-subheading" style={{ marginBottom: 24 }}>{text}</p>

          <div className="atc-caption-wrap">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.n}
                className="atc-caption"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <span className="atc-caption__tag">{slide.n} — {slide.tag}</span>
                <h3 className="atc-caption__title">{slide.title}</h3>
                <p className="atc-caption__text">{slide.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <Link to="/about" className="btn btn-dark" style={{ marginTop: 8 }}>
            More About Us <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
