import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCloud, FaShieldAlt, FaHeadset, FaNetworkWired, FaCode,
  FaDatabase, FaMicrochip, FaUsersCog, FaArrowRight, FaSyncAlt,
} from "react-icons/fa";
import "./ServiceCard.css";

const ICONS = {
  cloud: FaCloud,
  shield: FaShieldAlt,
  support: FaHeadset,
  network: FaNetworkWired,
  code: FaCode,
  database: FaDatabase,
  chip: FaMicrochip,
  headset: FaUsersCog,
};

export default function ServiceCard({ service, index = 0 }) {
  const Icon = ICONS[service.icon] || FaCloud;
  const cardRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    // The whole card is a single link, so a click anywhere navigates —
    // on the front face or the flipped-back face, mid-rotation or not.
    <Link
      ref={cardRef}
      to="/services"
      className={`svc-flip ${visible ? "svc-flip--visible" : ""}`}
      style={{ transitionDelay: `${index * 110}ms` }}
      aria-label={`${service.title} — learn more`}
    >
      <div className="svc-flip__inner">
        {/* Front */}
        <div className="svc-flip__face svc-flip__front">
          <span className="svc-flip__hint" aria-hidden="true"><FaSyncAlt /></span>
          <span className="svc-flip__icon"><Icon /></span>
          <h3 className="svc-flip__title">{service.title}</h3>
          <p className="svc-flip__desc">{service.short_description}</p>
          <span className="svc-flip__link">
            Learn more <FaArrowRight aria-hidden="true" />
          </span>
        </div>

        {/* Back (revealed on hover) */}
        <div className="svc-flip__face svc-flip__back">
          <span className="svc-flip__icon svc-flip__icon--back"><Icon /></span>
          <h3 className="svc-flip__title">Let&rsquo;s talk {service.title}</h3>
          <p className="svc-flip__desc">
            See how Alpha Edge can put this to work for your business.
          </p>
          <span className="svc-flip__link">
            Explore services <FaArrowRight aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
