import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBalanceScale, FaClipboardCheck, FaShieldAlt, FaCertificate, FaArrowRight } from "react-icons/fa";
import PageHero from "../components/PageHero";
import { getWhoWeAreImages, adminUpdateWhoWeAreImage } from "../api/client";
import { DEFAULT_APART_IMAGE, DEFAULT_CAPABILITY_IMAGES } from "../data/contentDefaults";
import { useAdminAuth } from "../hooks/useAdminAuth";
import EditIconButton from "../components/EditIconButton";
import EditModal from "../components/EditModal";
import "./WhoWeAre.css";

const STATS = [
  { n: "50+", label: "Projects delivered" },
  { n: "20+", label: "Clients served" },
  { n: "24/7", label: "Support cover" },
];

const VALUES = [
  {
    icon: FaBalanceScale,
    tag: "Independent",
    title: "No vendor tie",
    text: "We specify what fits the network and the budget, not what a partner quota requires.",
  },
  {
    icon: FaClipboardCheck,
    tag: "Verified",
    title: "Tested before dispatch",
    text: "Serial-checked, powered up and configuration-verified in our own workshop.",
  },
  {
    icon: FaShieldAlt,
    tag: "Backed",
    title: "Supported after sale",
    text: "Warranty, RMA handling and engineering support stay with you long after delivery.",
  },
];

// Images come from state (capabilityImages, indexed 0-3) so an admin edit
// via /admin overrides them without touching this text.
const CAPABILITIES = [
  {
    n: "01",
    tag: "Sourcing",
    title: "Multi-brand hardware, sourced right",
    text: "Cisco, HPE Aruba, Dell, Fortinet and more — new, factory-sealed or professionally refurbished, matched to your spec and budget, not a vendor quota.",
  },
  {
    n: "02",
    tag: "Build",
    title: "Racked, wired and configured in-house",
    text: "Every unit is unboxed, mounted and configured against your network parameters in our own workshop before it ever reaches a courier.",
  },
  {
    n: "03",
    tag: "Verify",
    title: "Serial-checked and stress-tested",
    text: "Powered up, diagnostics run, serial numbers logged against the order — so what arrives on site is proven, not just repackaged.",
  },
  {
    n: "04",
    tag: "Support",
    title: "Backed long after the invoice is paid",
    text: "Warranty handling, RMA turnaround and hands-on engineering support stay with your business well past go-live.",
  },
];

export default function WhoWeAre() {
  const { isAdmin } = useAdminAuth();
  const [apartImage, setApartImage] = useState(DEFAULT_APART_IMAGE);
  const [capabilityImages, setCapabilityImages] = useState(DEFAULT_CAPABILITY_IMAGES);
  const [editingApart, setEditingApart] = useState(false);
  const [editingCapability, setEditingCapability] = useState(null); // null | index

  useEffect(() => {
    getWhoWeAreImages()
      .then((d) => {
        setApartImage(d.apartImage || DEFAULT_APART_IMAGE);
        setCapabilityImages(
          DEFAULT_CAPABILITY_IMAGES.map((def, i) => d.capabilityImages?.[i] || def)
        );
      })
      .catch(() => {
        setApartImage(DEFAULT_APART_IMAGE);
        setCapabilityImages(DEFAULT_CAPABILITY_IMAGES);
      });
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Who We Are"
        title="A UK technology partner for the hardware your network runs on"
        subtitle="London-based supplier and integrator of enterprise IT hardware."
        variant="who"
      />

      {/* Intro + stats (light) */}
      <section className="section wwa-intro">
        <div className="container">
          <p className="wwa-intro__lead">
            Alpha Edge IT Services Ltd is a London-based supplier and integrator of enterprise
            IT hardware. We source networking and data-centre equipment across every major
            brand — new, factory-sealed or professionally refurbished — and wrap it in the
            engineering, configuration and support that make it useful on day one.
          </p>

          <div className="wwa-stats">
            {STATS.map((s) => (
              <div className="wwa-stat" key={s.label}>
                <span className="wwa-stat__n">{s.n}</span>
                <span className="wwa-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values (dark band) */}
      <section className="section wwa-values bg-dot-pattern">
        <div className="container wwa-values__layout">
          <div className="wwa-values__text">
            <span className="eyebrow eyebrow--light">What sets us apart</span>
            <h2 className="section-heading">Independent, verified, and backed</h2>
            <div className="wwa-values__list">
              {VALUES.map((v) => {
                const Icon = v.icon;
                return (
                  <div className="wwa-value" key={v.tag}>
                    <span className="wwa-value__icon"><Icon /></span>
                    <div className="wwa-value__body">
                      <span className="wwa-value__tag">{v.tag}</span>
                      <h3 className="wwa-value__title">{v.title}</h3>
                      <p className="wwa-value__text">{v.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="wwa-values__visual">
            <div className={`wwa-values__frame ${isAdmin ? "editable-hover-target" : ""}`}>
              <img src={apartImage} alt="Alpha Edge engineer at work" loading="lazy" />
              {isAdmin && <EditIconButton onClick={() => setEditingApart(true)} label="Edit this photo" />}
            </div>
            <span className="wwa-values__badge">
              <FaCertificate />
            </span>
          </div>
        </div>
      </section>

      {/* Capability showcase (light) */}
      <section className="section wwa-showcase">
        <div className="container">
          <span className="eyebrow">How We Work</span>
          <h2 className="section-heading">From sourcing to support, handled in-house</h2>
          <p className="section-subheading">
            Every order moves through the same four stages before it reaches your site.
          </p>

          <div className="wwa-capabilities">
            {CAPABILITIES.map((c, i) => (
              <div className="wwa-capability" key={c.n}>
                <div className={`wwa-capability__media ${isAdmin ? "editable-hover-target" : ""}`}>
                  <img src={capabilityImages[i]} alt={c.title} loading="lazy" />
                  <span className="wwa-capability__ghost">{c.n}</span>
                  {isAdmin && (
                    <EditIconButton onClick={() => setEditingCapability(i)} label={`Edit ${c.tag} photo`} />
                  )}
                </div>
                <div className="wwa-capability__body">
                  <span className="wwa-capability__tag">{c.n} — {c.tag}</span>
                  <h3 className="wwa-capability__title">{c.title}</h3>
                  <p className="wwa-capability__text">{c.text}</p>
                  <span className="wwa-capability__line" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA (light) */}
      <section className="section wwa-cta-wrap">
        <div className="container wwa-cta">
          <div>
            <h2 className="section-heading" style={{ marginBottom: 8 }}>
              Send us a part number or a bill of materials
            </h2>
            <p className="section-subheading" style={{ marginBottom: 0 }}>
              Tell us what you need and we will source, verify and quote it.
            </p>
          </div>
          <Link to="/get-a-quote" className="btn btn-accent">
            Get a Quote <FaArrowRight />
          </Link>
        </div>
      </section>

      {editingApart && (
        <EditModal
          folder="whoweare"
          title="Edit Photo"
          fields={[{ name: "image", label: "Photo", type: "image" }]}
          initialValues={{ image: apartImage }}
          onClose={() => setEditingApart(false)}
          onSave={async (values) => {
            await adminUpdateWhoWeAreImage({ type: "apart", image: values.image });
            setApartImage(values.image);
          }}
        />
      )}

      {editingCapability !== null && (
        <EditModal
          folder="whoweare"
          title={`Edit ${CAPABILITIES[editingCapability].tag} Photo`}
          fields={[{ name: "image", label: "Photo", type: "image" }]}
          initialValues={{ image: capabilityImages[editingCapability] }}
          onClose={() => setEditingCapability(null)}
          onSave={async (values) => {
            await adminUpdateWhoWeAreImage({ type: "capability", index: editingCapability, image: values.image });
            setCapabilityImages((prev) => prev.map((p, idx) => (idx === editingCapability ? values.image : p)));
          }}
        />
      )}
    </>
  );
}
