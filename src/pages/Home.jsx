import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import HeroSlider from "../components/HeroSlider";
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

export default function Home() {
  const [home, setHome] = useState(placeholderHome);
  const [services, setServices] = useState(placeholderServices);

  useEffect(() => {
    getHomepageContent().then(setHome).catch(() => setHome(placeholderHome));
    getServices().then((d) => d.length && setServices(d)).catch(() => setServices(placeholderServices));
  }, []);

  return (
    <>
      {/* HERO */}
      <HeroSlider ctaText={home.hero_cta_text} ctaLink={home.hero_cta_link} />

      <StatBar home={home} />

      {/* SERVICES */}
      <section className="section section-alt services-section">
        <div className="container">
          <span className="eyebrow">What We Do</span>
          <h2 className="section-heading">Full-Spectrum IT Services for Modern Business</h2>
          <p className="section-subheading">
            From cloud and cybersecurity to bespoke software, Alpha Edge delivers the technology
            backbone your business needs to move faster and stay secure.
          </p>
          <div className="grid grid-3">
            {services.slice(0, 6).map((s, i) => (
              <ServiceCard key={s.id ?? s.slug} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* TOP PRODUCTS */}
      <TopProducts />
      


      <Technologies />

      {/* TOP PRODUCTS */}
      {/* <TopProducts /> */}

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
