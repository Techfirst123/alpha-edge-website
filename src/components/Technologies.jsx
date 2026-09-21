import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaNetworkWired, FaStream, FaShieldAlt, FaWifi, FaServer,
  FaHdd, FaMicrochip, FaPhoneAlt, FaArrowRight,
} from "react-icons/fa";
import { getSupplyCategories } from "../api/client";
import { DEFAULT_CATEGORIES } from "../data/contentDefaults";
import hubLogo from "../assets/Alpha_Edge_logos.jpg";
import "./Technologies.css";

// Icons are assigned by rotation (not chosen per item) so admin-added
// categories always get a sensible icon without touching styling/icon
// choice through the admin panel.
const ICONS = [FaNetworkWired, FaStream, FaShieldAlt, FaWifi, FaServer, FaHdd, FaMicrochip, FaPhoneAlt];

// Brands we deal in. Drop official logo files into /public/brands/<file> and
// they render automatically; until then a clean text name is shown instead.
const BRANDS = [
  { name: "Cisco", file: "cisco.svg" },
  { name: "HPE", file: "hpe.svg" },
  { name: "Aruba", file: "aruba.svg" },
  { name: "Dell", file: "dell.svg" },
  { name: "Lenovo", file: "lenovo.svg" },
  { name: "Juniper", file: "juniper.svg" },
  { name: "Fortinet", file: "fortinet.svg" },
  { name: "Palo Alto", file: "palo-alto.svg" },
  { name: "Huawei", file: "huawei.svg" },
  { name: "VMware", file: "vmware.svg" },
  { name: "Ruckus", file: "ruckus.png" },
  { name: "Extreme", file: "extreme.png" },
  { name: "Arista", file: "arista.svg" },
  { name: "D-Link", file: "d-link.svg" },
  { name: "TP-Link", file: "tp-link.svg" },
  { name: "Hikvision", file: "hikvision.svg" },
  { name: "Avaya", file: "avaya.svg" },
  { name: "Polycom", file: "polycom.svg" },
  { name: "Alcatel-Lucent", file: "alcatel-lucent.svg" },
  { name: "Brocade", file: "brocade.svg" },
  { name: "Samsung", file: "samsung.svg" },
  { name: "EMC", file: "emc.svg" },
  { name: "Intel", file: "intel.svg" },
  { name: "AMD", file: "amd.svg" },
  { name: "IBM", file: "ibm.svg" },
  { name: "Mellanox", file: "mellanox.svg" },
  { name: "Nokia", file: "nokia.svg" },
  { name: "Hitachi", file: "hitachi.svg" },
];

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function CategoryTile({ item, index }) {
  const [ref, visible] = useReveal();
  const Icon = ICONS[index % ICONS.length];
  return (
    <div
      ref={ref}
      className={`vendor-cat ${visible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <span className="vendor-cat__icon icon-flip">
        <span className="icon-flip__inner">
          <span className="icon-flip__face icon-flip__face--front"><Icon /></span>
          <span className="icon-flip__face icon-flip__face--back"><Icon /></span>
        </span>
      </span>
      <span className="vendor-cat__body">
        <span className="vendor-cat__label">{item.label}</span>
        <span className="vendor-cat__sub">{item.sub}</span>
      </span>
    </div>
  );
}

// One logo "planet" on the orbit. The chip counter-rotates against its ring
// so the logo always stays upright while the ring turns.
function OrbitLogo({ brand, index, count }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <li className="brand-orbit__item" style={{ "--i": index, "--count": count }}>
      <span className="brand-orbit__chip" title={brand.name}>
        {imgOk ? (
          <img src={`/brands/${brand.file}`} alt={brand.name} loading="lazy" onError={() => setImgOk(false)} />
        ) : (
          <span className="brand-orbit__name">{brand.name}</span>
        )}
      </span>
    </li>
  );
}

// Split the brand list across the two rings: fewer on the inner ring (it's
// smaller), the rest on the outer ring.
const INNER_COUNT = 10;
const INNER_BRANDS = BRANDS.slice(0, INNER_COUNT);
const OUTER_BRANDS = BRANDS.slice(INNER_COUNT);

export default function Technologies() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    getSupplyCategories()
      .then((d) => d.categories?.length && setCategories(d.categories))
      .catch(() => setCategories(DEFAULT_CATEGORIES));
  }, []);

  return (
    <section className="section vendors">
      <div className="container">
        <span className="eyebrow">What We Supply</span>
        <h2 className="section-heading">Everything Your Network Runs On</h2>
        <p className="section-subheading">
          From switches and firewalls to servers and optics — sourced from the vendors the
          industry trusts, and matched to what your deployment actually needs.
        </p>

        <div className="vendor-cats">
          {categories.map((c, i) => (
            <CategoryTile item={c} index={i} key={c.label} />
          ))}
        </div>

        <div className="brand-showcase">
          <div className="brand-showcase__copy">
            <span className="eyebrow">Our Vendors</span>
            <h3>Brands we deal in</h3>
            <p>
              Sourcing across {BRANDS.length}+ leading networking &amp; IT vendors — new, sealed and
              certified refurbished, all through one partner.
            </p>
            <ul className="brand-showcase__stats">
              <li>
                <strong>{BRANDS.length}+</strong>
                <span>Vendors</span>
              </li>
              <li>
                <strong>10K+</strong>
                <span>Items in stock</span>
              </li>
              <li>
                <strong>3-5</strong>
                <span>Day delivery</span>
              </li>
            </ul>
            <Link to="/products" className="vendors-browse">
              Browse the catalogue <FaArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className="brand-orbit" role="group" aria-label="Brands we deal in">
            <span className="brand-orbit__glow" aria-hidden="true" />
            <span className="brand-orbit__ring brand-orbit__ring--outer" aria-hidden="true" />
            <span className="brand-orbit__ring brand-orbit__ring--inner" aria-hidden="true" />

            <ul className="brand-orbit__track brand-orbit__track--outer">
              {OUTER_BRANDS.map((b, i) => (
                <OrbitLogo brand={b} index={i} count={OUTER_BRANDS.length} key={b.name} />
              ))}
            </ul>
            <ul className="brand-orbit__track brand-orbit__track--inner">
              {INNER_BRANDS.map((b, i) => (
                <OrbitLogo brand={b} index={i} count={INNER_BRANDS.length} key={b.name} />
              ))}
            </ul>

            <div className="brand-orbit__hub">
              <img src={hubLogo} alt="Alpha Edge IT Solutions" />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
