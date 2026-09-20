import { useEffect, useState } from "react";
import { FaCookieBite, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { COOKIE_CONSENT_STORAGE_KEY } from "../utils/cookieConsent";
import "./CookieConsent.css";

const COOKIE_DETAILS = [
  { name: "alphaedge_cookie_consent", purpose: "Remembers your cookie choice", duration: "Until you clear site data" },
  { name: "alphaedge_visitor_id", purpose: "Anonymous ID so we can count returning visitors", duration: "Until you clear site data" },
  { name: "alphaedge_session_id", purpose: "Groups your page views into one visit for analytics", duration: "This browser session" },
];

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!saved) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const decide = (choice) => {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify({ choice, decidedAt: Date.now() }));
    window.dispatchEvent(new CustomEvent("cookieconsentchange", { detail: { choice } }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <div className="cookie-consent__inner">
        <div className="cookie-consent__icon">
          <FaCookieBite />
        </div>

        <div className="cookie-consent__content">
          <p className="cookie-consent__text">
            We use cookies to improve your browsing experience, understand how visitors use our site,
            and personalise content. By clicking &ldquo;Accept All&rdquo;, you consent to our use of
            cookies. You can choose &ldquo;Reject Non-Essential&rdquo; to only allow cookies necessary
            for the site to function.
          </p>

          <button
            type="button"
            className="cookie-consent__toggle"
            onClick={() => setShowDetails((v) => !v)}
            aria-expanded={showDetails}
          >
            {showDetails ? "Hide" : "What cookies do we use?"} {showDetails ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {showDetails && (
            <div className="cookie-consent__table-wrap">
              <table className="cookie-consent__table">
                <thead>
                  <tr>
                    <th>Cookie</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIE_DETAILS.map((c) => (
                    <tr key={c.name}>
                      <td>{c.name}</td>
                      <td>{c.purpose}</td>
                      <td>{c.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="cookie-consent__actions">
          <button className="cookie-consent__btn cookie-consent__btn--reject" onClick={() => decide("rejected")}>
            Reject Non-Essential
          </button>
          <button className="cookie-consent__btn cookie-consent__btn--accept" onClick={() => decide("accepted")}>
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
