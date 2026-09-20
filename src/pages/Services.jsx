import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import PageHero from "../components/PageHero";
import ServiceExplorer from "../components/ServiceExplorer";
import Technologies from "../components/Technologies";
import { getServices } from "../api/client";
import { placeholderServices } from "../data/placeholder";
import "./Services.css";

export default function Services() {
  const [services, setServices] = useState(placeholderServices);

  useEffect(() => {
    getServices().then((d) => d.length && setServices(d)).catch(() => setServices(placeholderServices));
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="IT Services Built Around Your Business"
        subtitle="Every engagement starts with understanding your goals — then we build the technology to match."
      />

      <section className="section section-alt">
        <div className="container">
          <ServiceExplorer services={services} />
        </div>
      </section>

      <Technologies />

      <section className="section services-cta">
        <div className="container services-cta__inner">
          <div>
            <h2>Not sure which service is right for you?</h2>
            <p>Our team will assess your current setup and recommend the best path forward — free of charge.</p>
          </div>
          <Link to="/contact" className="btn btn-primary">
            Talk to an Expert <FaArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}
