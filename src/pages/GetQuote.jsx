import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaPaperPlane } from "react-icons/fa";
import PageHero from "../components/PageHero";
import { getServices, submitLead } from "../api/client";
import { placeholderServices } from "../data/placeholder";
import "./Contact.css";
import "./GetQuote.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service_interest: "",
  budget: "",
  message: "",
};

const steps = [
  { title: "Tell us about your project", text: "Share a few details about what you need and where you're stuck." },
  { title: "We review your requirements", text: "Our team assesses your setup and puts together a tailored quote." },
  { title: "Get your free quote", text: "We'll get back to you within one business day with pricing and next steps." },
];

export default function GetQuote() {
  const [searchParams] = useSearchParams();
  const prefillModel = searchParams.get("model") || "";
  const prefillProduct = searchParams.get("product") || "";

  const [services, setServices] = useState(placeholderServices);
  const [form, setForm] = useState(() =>
    prefillModel || prefillProduct
      ? {
          ...initialForm,
          service_interest: "Hardware / Product Supply",
          message:
            `Product enquiry — please send pricing and lead time.\n\n` +
            `Product: ${prefillProduct || "(see model)"}\n` +
            `Model no.: ${prefillModel || "(not specified)"}\n` +
            `Quantity required: `,
        }
      : initialForm
  );
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  useEffect(() => {
    getServices().then((d) => d.length && setServices(d)).catch(() => setServices(placeholderServices));
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitLead({
        ...form,
        subject: prefillModel ? `Product Price Request — ${prefillModel}` : "Quote Request",
        source_page: prefillModel ? "products" : "get-a-quote",
      });
      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Get a Quote"
        title="Get Your Free, No-Obligation IT Quote"
        subtitle="Tell us a bit about your business and what you need — we'll put together a tailored quote within one business day."
      />

      <section className="section section-alt">
        <div className="container contact-grid">
          <div className="contact-info">
            <h2>How It Works</h2>
            <p className="contact-info__intro">
              A quick, no-pressure way to find out exactly what your project or support plan will cost.
            </p>

            {steps.map((s, i) => (
              <div className="quote-step" key={s.title}>
                <span className="quote-step__index">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}

            <div className="quote-guarantee">
              <FaCheckCircle />
              <span>No obligation, no pressure — just a clear, honest quote.</span>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            {prefillModel && (
              <div
                className="quote-prefill"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  marginBottom: 20,
                  borderRadius: "var(--radius)",
                  background: "rgba(12, 90, 219, 0.07)",
                  border: "1px solid rgba(12, 90, 219, 0.18)",
                  color: "var(--navy-800)",
                  fontSize: 14.5,
                }}
              >
                <FaCheckCircle style={{ color: "var(--blue-500)", flexShrink: 0 }} />
                <span>
                  Requesting a price for <strong>{prefillModel}</strong>
                  {prefillProduct ? ` — ${prefillProduct}` : ""}. Add your details and
                  we&rsquo;ll send pricing &amp; lead time.
                </span>
              </div>
            )}
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
            <div className="contact-form__row">
              <div className="contact-form__field">
                <label>Service Interested In</label>
                <select name="service_interest" value={form.service_interest} onChange={handleChange}>
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s.id ?? s.slug} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                  <option value="Hardware / Product Supply">Hardware / Product Supply</option>
                  <option value="Other">Other / Not sure</option>
                </select>
              </div>
              <div className="contact-form__field">
                <label>Estimated Budget</label>
                <input name="budget" value={form.budget} onChange={handleChange} placeholder="e.g. £5,000 - £10,000" />
              </div>
            </div>
            <div className="contact-form__field">
              <label>Project Details *</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Tell us about your project, current setup, and timeline..."
              />
            </div>

            <button className="btn btn-primary contact-form__submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending..." : "Request My Quote"} <FaPaperPlane />
            </button>

            {status === "success" && (
              <p className="contact-form__notice contact-form__notice--success">
                Thanks! Your quote request has been received — we'll be in touch shortly.
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
    </>
  );
}
