import { useEffect, useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";
import PageHero from "../components/PageHero";
import { getSiteSettings, submitLead } from "../api/client";
import { placeholderSiteSettings } from "../data/placeholder";
import "./Contact.css";

const initialForm = { name: "", email: "", phone: "", company: "", subject: "", message: "" };

export default function Contact() {
  const [settings, setSettings] = useState(placeholderSiteSettings);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  useEffect(() => {
    getSiteSettings().then((d) => setSettings({ ...placeholderSiteSettings, ...d })).catch(() => setSettings(placeholderSiteSettings));
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitLead({ ...form, source_page: "contact" });
      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="Let's Build Something Great Together"
        subtitle="Tell us about your project or challenge — our team will get back to you within one business day."
        variant="contact"
      />

      <section className="section section-alt">
        <div className="container contact-grid">
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p className="contact-info__intro">
              Whether you need a quick fix or a full digital transformation, we're ready to help.
            </p>

            <div className="contact-info__item">
              <FaPhoneAlt />
              <div>
                <span className="contact-info__label">Phone</span>
                <span>{settings.phone_primary}</span>
              </div>
            </div>
            <div className="contact-info__item">
              <FaEnvelope />
              <div>
                <span className="contact-info__label">Email</span>
                <span>{settings.email_primary}</span>
              </div>
            </div>
            <div className="contact-info__item">
              <FaMapMarkerAlt />
              <div>
                <span className="contact-info__label">Registered Office</span>
                <span>
                  {[settings.address_line1, settings.address_line2, settings.city, settings.country, settings.postcode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form__row">
              <div className="contact-form__field">
                <label>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Jane Doe" />
              </div>
              <div className="contact-form__field">
                <label>Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="jane@company.com" />
              </div>
            </div>
            <div className="contact-form__row">
              <div className="contact-form__field">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+44 ..." />
              </div>
              <div className="contact-form__field">
                <label>Company</label>
                <input name="company" value={form.company} onChange={handleChange} placeholder="Company Ltd" />
              </div>
            </div>
            <div className="contact-form__field">
              <label>Subject</label>
              <input name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?" />
            </div>
            <div className="contact-form__field">
              <label>Message *</label>
              <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Tell us about your project..." />
            </div>

            <button className="btn btn-primary contact-form__submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending..." : "Send Message"} <FaPaperPlane />
            </button>

            {status === "success" && (
              <p className="contact-form__notice contact-form__notice--success">
                Thanks! Your message has been received — we'll be in touch shortly.
              </p>
            )}
            {status === "error" && (
              <p className="contact-form__notice contact-form__notice--error">
                Something went wrong. Please make sure the backend server is running, or email us directly.
              </p>
            )}
          </form>
        </div>
      </section>

      <section className="contact-map">
        <div className="contact-map__placeholder">
          <span>Map placeholder — embed Google Maps here once the office address is confirmed.</span>
        </div>
      </section>
    </>
  );
}
