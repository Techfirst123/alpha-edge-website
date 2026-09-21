import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBullseye, FaEye, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import PageHero from "../components/PageHero";
import aboutEditorial from "../assets/about/editorial-team.webp";
import { getAboutContent, getHomepageContent, getTeam } from "../api/client";
import { placeholderAbout, placeholderHome, placeholderTeam } from "../data/placeholder";
import "./About.css";

// Black 3D signage version of the logo — the flat banner lockup now lives on
// the home hero, so About uses the dimensional treatment instead.
// Served from public/about/ as a plain URL rather than imported, so the build
// never depends on resolving this file (it's copied into dist/ as-is).
// const aboutHeroBg = "/about/ae-logo-3d.jpg";
import aboutHeroBg from "../assets/about/ae-logo-3d.jpg";

export default function About() {
  const [about, setAbout] = useState(placeholderAbout);
  const [home, setHome] = useState(placeholderHome);
  const [team, setTeam] = useState(placeholderTeam);

  useEffect(() => {
    getAboutContent().then(setAbout).catch(() => setAbout(placeholderAbout));
    getHomepageContent().then(setHome).catch(() => setHome(placeholderHome));
    getTeam().then((d) => d.length && setTeam(d)).catch(() => setTeam(placeholderTeam));
  }, []);

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title={about.heading}
        subtitle="Get to know the team and story behind Alpha Edge IT Services."
        image={aboutHeroBg}
      />

      <section className="section section-alt">
        <div className="container about-editorial">
          <div className="about-editorial__copy">
            <span className="eyebrow">About Us</span>
            <h2 className="section-heading">
              We turn complex technology into simple business solutions.
            </h2>
            <p className="about-editorial__text">{about.intro_text}</p>
            <Link to="/contact" className="btn btn-dark">
              Talk to Our Team <FaArrowRight />
            </Link>
          </div>

          <div className="about-editorial__visual">
            <div className="about-editorial__frame">
              <img src={aboutEditorial} alt="Alpha Edge IT Services team at work" loading="lazy" />
            </div>
            {/* The "Years Experience" badge that sat top-left has been
                removed; only the Projects Delivered figure remains. */}
            <div className="about-editorial__stat about-editorial__stat--bottom">
              <span>{home.stats_projects}+</span>
              <small>Projects Delivered</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section why-us">
        <div className="container">
          <div className="grid grid-2 about-mv">
            <div className="about-mv__card">
              <FaBullseye />
              <h3>Our Mission</h3>
              <p>{about.mission_text}</p>
            </div>
            <div className="about-mv__card">
              <FaEye />
              <h3>Our Vision</h3>
              <p>{about.vision_text}</p>
            </div>
          </div>

          <span className="eyebrow why-us__eyebrow">Why Alpha Edge</span>
          <h2 className="section-heading">Built on Trust, Driven by Results</h2>
          <div className="grid grid-3">
            {[
              "Certified, experienced engineers across every discipline",
              "Rapid response times with proactive monitoring",
              "Transparent, fixed pricing — no surprise invoices",
              "Scalable solutions that grow with your business",
              "UK-based team, always reachable",
              "Security-first approach on every engagement",
            ].map((item) => (
              <div className="why-us__item" key={item}>
                <FaCheckCircle />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <span className="eyebrow">Our People</span>
          <h2 className="section-heading">Meet the Team</h2>
          <p className="section-subheading">The experts behind every project we deliver.</p>
          <div className="grid grid-3">
            {team.map((m) => (
              <div className="team-card" key={m.id ?? m.name}>
                <div className="team-card__avatar">{m.name.split(" ").map((n) => n[0]).join("")}</div>
                <h3>{m.name}</h3>
                <span className="team-card__role">{m.role}</span>
                <p>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
