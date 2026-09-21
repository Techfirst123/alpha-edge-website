import { NavLink } from "react-router-dom";
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaInstagram, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
// Wide rectangular lockup (AE mark + wordmark), not the square badge.
import logo from "../assets/alpha-edge-logo-wide.png";
import "./Footer.css";

export default function Footer({ settings }) {
  const s = settings || {};

  const socials = [
    { url: s.facebook_url, icon: <FaFacebookF /> },
    { url: s.linkedin_url, icon: <FaLinkedinIn /> },
    { url: s.twitter_url, icon: <FaTwitter /> },
    { url: s.instagram_url, icon: <FaInstagram /> },
  ].filter((x) => x.url);

  return (
    <footer className="footer bg-dot-pattern">
      <div className="container footer__grid">
        <div className="footer__brand">
          <img src={logo} alt={s.site_name || "Alpha Edge IT Services Ltd"} />
          <p className="footer__about">
            {s.footer_about_text ||
              "Alpha Edge IT Services Ltd delivers cutting-edge technology solutions that help businesses grow, modernise, and stay secure."}
          </p>
          {socials.length > 0 && (
            <div className="footer__socials">
              {socials.map((soc, i) => (
                <a key={i} href={soc.url} target="_blank" rel="noreferrer">
                  {soc.icon}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="footer__col">
          <h4>Quick Links</h4>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </div>

        <div className="footer__col">
          <h4>Services</h4>
          <span>Cloud Solutions</span>
          <span>Managed IT Support</span>
          <span>Networking &amp; Infrastructure</span>
        </div>

        <div className="footer__col">
          <h4>Get in Touch</h4>
          {s.phone_primary && (
            <span className="footer__contact-line">
              <FaPhoneAlt /> {s.phone_primary}
            </span>
          )}
          {s.email_primary && (
            <span className="footer__contact-line">
              <FaEnvelope /> {s.email_primary}
            </span>
          )}
          {(s.address_line1 || s.city) && (
            <span className="footer__contact-line">
              <FaMapMarkerAlt />
              <span>
                <strong className="footer__address-label">Registered Office:</strong>{" "}
                {[s.address_line1, s.address_line2, s.city, s.country, s.postcode].filter(Boolean).join(", ")}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>{s.footer_copyright_text || "© 2026 Alpha Edge IT Services Ltd. All rights reserved."}</span>
          <span className="footer__tagline">{s.tagline || "Solutions. Technology. Growth."}</span>
        </div>
      </div>
    </footer>
  );
}
