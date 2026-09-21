import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaNetworkWired, FaStream, FaShieldAlt, FaWifi, FaServer,
  FaHdd, FaMicrochip, FaPhoneAlt, FaArrowRight,
} from "react-icons/fa";
import { getSupplyCategories, adminUpdateSupplyCategories } from "../api/client";
import { DEFAULT_CATEGORIES } from "../data/contentDefaults";
import { useAdminAuth } from "../hooks/useAdminAuth";
import EditIconButton from "./EditIconButton";
import SupplyCategoriesModal from "./SupplyCategoriesModal";
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

function BrandTile({ brand, index }) {
  const [imgOk, setImgOk] = useState(true);
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height; // 0..1
    el.style.setProperty("--rx", `${(0.5 - py) * 16}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 18}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--lift", "1");
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--lift", "0");
  };

  return (
    <div
      className="brand-tile"
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transitionDelay: `${index * 35}ms` }}
    >
      <div className="brand-tile__inner">
        <span className="brand-tile__shine" aria-hidden="true" />
        {imgOk ? (
          <img
            className="brand-tile__logo"
            src={`/brands/${brand.file}`}
            alt={brand.name}
            loading="lazy"
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className="brand-tile__name">{brand.name}</span>
        )}
      </div>
    </div>
  );
}

export default function Technologies() {
  const { isAdmin } = useAdminAuth();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    getSupplyCategories()
      .then((d) => d.categories?.length && setCategories(d.categories))
      .catch(() => setCategories(DEFAULT_CATEGORIES));
  }, []);

  return (
    <section className={`section vendors ${isAdmin ? "editable-hover-target" : ""}`}>
      {isAdmin && <EditIconButton onClick={() => setEditing(true)} label="Edit What We Supply" />}
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

        <div className="vendors-brandhead">
          <div>
            <h3>Brands we deal in</h3>
            <p>Sourcing across {BRANDS.length}+ leading networking &amp; IT vendors.</p>
          </div>
          <Link to="/products" className="vendors-browse">
            Browse the catalogue <FaArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="brand-grid">
          {BRANDS.map((b, i) => (
            <BrandTile brand={b} index={i} key={b.name} />
          ))}
        </div>
      </div>

      {editing && (
        <SupplyCategoriesModal
          initialCategories={categories}
          onClose={() => setEditing(false)}
          onSave={async (newCategories) => {
            await adminUpdateSupplyCategories(newCategories);
            setCategories(newCategories);
          }}
        />
      )}
    </section>
  );
}
