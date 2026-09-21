import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import Technologies from "../components/Technologies";
import "./Services.css";

// The "IT Services Built Around Your Business" page hero and the six-item
// ServiceExplorer accordion beneath it have been removed. What remains is the
// supply/brands section and the closing CTA. Note this page is no longer
// linked from the main navigation either (that slot is now "Products"), so
// it's only reachable via a direct /services URL.
export default function Services() {
  return (
    <>
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
