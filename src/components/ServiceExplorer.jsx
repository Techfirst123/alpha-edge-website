import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCloud, FaShieldAlt, FaHeadset, FaNetworkWired, FaCode, FaDatabase, FaArrowRight,
} from "react-icons/fa";
import cloudImg from "../assets/services/cloud-solutions.webp";
import cybersecurityImg from "../assets/services/cybersecurity.webp";
import supportImg from "../assets/services/managed-support.webp";
import networkImg from "../assets/services/networking.webp";
import softwareImg from "../assets/services/software-development.webp";
import dataImg from "../assets/services/data-analytics.webp";
import "./ServiceExplorer.css";

const ICONS = {
  cloud: FaCloud,
  shield: FaShieldAlt,
  support: FaHeadset,
  network: FaNetworkWired,
  code: FaCode,
  database: FaDatabase,
};

const TAGS = {
  "cloud-solutions": ["AWS", "Azure", "Migration", "Cost Optimisation"],
  cybersecurity: ["Threat Monitoring", "Firewalls", "Compliance", "Incident Response"],
  "managed-it-support": ["24/7 Helpdesk", "Remote Monitoring", "Patch Management", "On-site Support"],
  "networking-infrastructure": ["Network Design", "Wi-Fi & Cabling", "Virtualization", "Uptime SLAs"],
  "software-development": ["Web Apps", "Custom Software", "API Integration", "React / Node / Python"],
  "data-analytics": ["Dashboards", "Data Warehousing", "Reporting", "PostgreSQL / MySQL"],
};

const IMAGES = {
  "cloud-solutions": cloudImg,
  cybersecurity: cybersecurityImg,
  "managed-it-support": supportImg,
  "networking-infrastructure": networkImg,
  "software-development": softwareImg,
  "data-analytics": dataImg,
};

export default function ServiceExplorer({ services }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = services[activeIndex] || services[0];
  if (!active) return null;

  const ActiveIcon = ICONS[active.icon] || FaCloud;
  const tags = TAGS[active.slug] || [];
  const image = IMAGES[active.slug];

  return (
    <div className="service-explorer">
      <div className="service-explorer__list" role="tablist" aria-label="Services">
        {services.map((s, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={s.id ?? s.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`service-explorer__item ${isActive ? "service-explorer__item--active" : ""}`}
              onClick={() => setActiveIndex(i)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className="service-explorer__index">{String(i + 1).padStart(2, "0")}</span>
              <span className="service-explorer__title">{s.title}</span>
              <FaArrowRight className="service-explorer__arrow" />
            </button>
          );
        })}
      </div>

      <div className="service-explorer__panel" key={active.id ?? active.slug}>
        {image && (
          <div className="service-explorer__bg">
            <img src={image} alt="" loading="lazy" />
            <div className="service-explorer__scrim" />
          </div>
        )}
        <div className="service-explorer__content">
          <div className="service-explorer__visual">
            <ActiveIcon />
          </div>
          <h3>{active.title}</h3>
          <p>{active.short_description}</p>
          {tags.length > 0 && (
            <ul className="service-explorer__tags">
              {tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          <Link to="/get-a-quote" className="btn btn-primary">
            Get a Quote <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
