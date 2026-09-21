import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import HeroModern from "../components/HeroModern";
import ServiceCard from "../components/ServiceCard";
import StatBar from "../components/StatBar";
import Technologies from "../components/Technologies";
import TopProducts from "../components/TopProducts";
import SalesProcess from "../components/SalesProcess";
import Expertise from "../components/Expertise";
import AboutTeaserCarousel from "../components/AboutTeaserCarousel";
import RatingsFeedback from "../components/RatingsFeedback";
import { getHomepageContent, getServices } from "../api/client";
import { placeholderHome, placeholderServices } from "../data/placeholder";
import "./Home.css";

// Services retired from the site. Kept as a filter (rather than a whitelist)
// so anything an admin adds later still shows up automatically; these three
// only disappear for good once they're deleted in the admin panel, at which
// point this list can go away.
const HIDDEN_SERVICE_SLUGS = new Set([
  "cybersecurity",
  "software-development",
  "data-analytics",
]);

export default function Home() {
  const [home, setHome] = useState(placeholderHome);
  const [services, setServices] = useState(placeholderServices);
  const visibleServices = services.filter((s) => !HIDDEN_SERVICE_SLUGS.has(s.slug));

  useEffect(() => {
    getHomepageContent().then((d) => setHome({ ...placeholderHome, ...d })).catch(() => setHome(placeholderHome));
    getServices().then((d) => d.length && setServices(d)).catch(() => setServices(placeholderServices));
  }, []);

  return (
    <>
      {/* HERO */}
      <HeroModern ctaText={home.hero_cta_text} ctaLink={home.hero_cta_link} />

      <StatBar home={home} />

      {/* WHAT WE SUPPLY — deliberately sits above "What We Do": hardware
          supply is the primary business, services are the supporting offer. */}
      <Technologies />

      {/* WHAT WE DO */}
      <section className="section section-alt services-section">
        <div className="container">
          <span className="eyebrow">What We Do</span>
          <h2 className="section-heading">Full-Spectrum IT Services for Modern Business</h2>
          <p className="section-subheading">
            From cloud platforms to managed support and network infrastructure, Alpha Edge
            delivers the technology backbone your business needs to move faster and stay secure.
          </p>
          <div className="grid grid-3">
            {visibleServices.slice(0, 6).map((s, i) => (
              <ServiceCard key={s.id ?? s.slug} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* TOP PRODUCTS */}
      <TopProducts />

      {/* ABOUT TEASER */}
      <AboutTeaserCarousel
        heading={home.about_teaser_heading}
        text={home.about_teaser_text}
      />

      {/* SALES PROCESS */}
      <SalesProcess />

      {/* OUR EXPERTISE */}
      <Expertise />

      {/* RATINGS & FEEDBACK */}
      <RatingsFeedback />

      {/* CTA */}
      <section className="cta">
        <div className="container cta__inner">
          <div>
            <h2>Ready to give your business the edge?</h2>
            <p>Talk to our team about a free, no-obligation IT consultation.</p>
          </div>
          <Link to="/contact" className="btn btn-primary">
            Get a Free Consultation <FaArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}
