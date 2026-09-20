import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaRecycle, FaNetworkWired, FaCogs, FaPoundSign, FaArrowRight } from "react-icons/fa";
import "./SalesProcess.css";

const STEPS = [
  {
    icon: FaRecycle,
    title: "Refurbishment",
    text:
      "Refurbishment is the distribution of products (generally electronics) that have been previously returned…",
    cta: "Read More…",
    to: "/services",
    variant: "primary",
  },
  {
    icon: FaNetworkWired,
    title: "Network",
    text:
      "Tier1 Data Systems specializes in delivering Enterprise and Small/Medium size IT security solutions across a range of…",
    cta: "Read More…",
    to: "/services",
    variant: "primary",
  },
  {
    icon: FaCogs,
    title: "Configure to Order",
    text:
      "CTO, Configuration-To-Order, means the factory will assemble and install the products according to all…",
    cta: "Read More…",
    to: "/services",
    variant: "primary",
  },
  {
    icon: FaPoundSign,
    title: "Get a quote",
    text: "Contact us to get an offer for the product you are looking for.",
    cta: "Get a Quote",
    to: "/get-a-quote",
    variant: "accent",
  },
];

function SalesCard({ step, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const Icon = step.icon;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`sales-card ${visible ? "sales-card--visible" : ""}`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="sales-card__icon icon-flip">
        <span className="icon-flip__inner">
          <span className="icon-flip__face icon-flip__face--front"><Icon /></span>
          <span className="icon-flip__face icon-flip__face--back"><Icon /></span>
        </span>
      </div>
      <h3 className="sales-card__title">{step.title}</h3>
      <p className="sales-card__text">{step.text}</p>
      <Link
        to={step.to}
        className={`btn ${step.variant === "accent" ? "btn-accent" : "btn-primary"} sales-card__btn`}
      >
        <span className="sales-card__btn-face sales-card__btn-face--1">
          {step.cta} <FaArrowRight />
        </span>
        <span className="sales-card__btn-face sales-card__btn-face--2" aria-hidden="true">
          {step.cta} <FaArrowRight />
        </span>
      </Link>
    </div>
  );
}

export default function SalesProcess() {
  return (
    <section className="section sales-process">
      <div className="container">
        <div className="sales-process__head">
          <span className="eyebrow">Sales Process</span>
          <h2 className="section-heading">Take a look at our sales process</h2>
        </div>
        <div className="sales-process__grid">
          {STEPS.map((step, i) => (
            <SalesCard step={step} index={i} key={step.title} />
          ))}
        </div>
      </div>
    </section>
  );
}
