import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBoxes,
  FaChartLine,
  FaCog,
  FaEnvelopeOpenText,
  FaExternalLinkAlt,
  FaHome,
  FaImages,
  FaInfoCircle,
  FaLayerGroup,
  FaListUl,
  FaPhotoVideo,
  FaSignOutAlt,
  FaStar,
  FaTachometerAlt,
  FaTimes,
  FaTools,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { getLeads } from "./api";
import logo from "../assets/Alpha_Edge_logos.jpg";

// On admin.<domain> the public site lives on www.<domain>; elsewhere
// (localhost, workers.dev) it's the same host.
const publicSiteUrl = () => {
  const h = typeof window !== "undefined" ? window.location.hostname : "";
  return h.startsWith("admin.") ? `https://www.${h.slice(6)}/` : "/";
};

// Sidebar sections. `super: true` items are only shown to Super Admins.
const NAV = [
  {
    items: [
      { to: "/admin", label: "Overview", icon: FaTachometerAlt, end: true },
      { to: "/admin/enquiries", label: "Enquiries", icon: FaEnvelopeOpenText, badge: "leads" },
    ],
  },
  {
    heading: "Home page",
    items: [
      { to: "/admin/hero", label: "Hero slides", icon: FaPhotoVideo },
      { to: "/admin/homepage", label: "Home text & stats", icon: FaHome },
      { to: "/admin/supply", label: "What we supply", icon: FaListUl },
      { to: "/admin/expertise", label: "Expertise photos", icon: FaImages },
    ],
  },
  {
    heading: "Pages",
    items: [
      { to: "/admin/services", label: "Services", icon: FaTools },
      { to: "/admin/about", label: "About & team", icon: FaInfoCircle },
      { to: "/admin/who-we-are", label: "Who We Are", icon: FaLayerGroup },
    ],
  },
  {
    heading: "Catalogue",
    items: [{ to: "/admin/products", label: "Products", icon: FaBoxes }],
  },
  {
    heading: "Insights",
    items: [
      { to: "/admin/reviews", label: "Reviews", icon: FaStar },
      { to: "/admin/visitors", label: "Visitors", icon: FaChartLine },
    ],
  },
  {
    heading: "Settings",
    items: [
      { to: "/admin/settings", label: "Site settings", icon: FaCog },
      { to: "/admin/users", label: "Admin users", icon: FaUserShield, super: true },
    ],
  },
];

export default function AdminLayout() {
  const { adminName, adminEmail, isSuperAdmin, logout } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [newLeads, setNewLeads] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile drawer on navigation.
  useEffect(() => setOpen(false), [location.pathname]);

  // Unread-enquiry count for the sidebar badge; refreshed on navigation so
  // marking enquiries as read updates it.
  useEffect(() => {
    getLeads()
      .then((list) => setNewLeads(list.filter((l) => l.status === "new").length))
      .catch(() => {});
  }, [location.pathname]);

  const signOut = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const initials = (adminName || adminEmail || "A")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  return (
    <div className={`adm-shell ${open ? "is-nav-open" : ""}`}>
      <aside className="adm-side" aria-label="Admin navigation">
        <div className="adm-side__brand">
          <img src={logo} alt="" />
          <div>
            <strong>Alpha Edge</strong>
            <span>Admin panel</span>
          </div>
          <button type="button" className="adm-icon-btn adm-side__close" onClick={() => setOpen(false)} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <nav className="adm-side__nav">
          {NAV.map((group, gi) => {
            const items = group.items.filter((i) => !i.super || isSuperAdmin);
            if (!items.length) return null;
            return (
              <div className="adm-side__group" key={gi}>
                {group.heading && <span className="adm-side__heading">{group.heading}</span>}
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => `adm-side__link ${isActive ? "is-active" : ""}`}
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                      {item.badge === "leads" && newLeads > 0 && <em className="adm-side__badge">{newLeads}</em>}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="adm-side__foot">
          <span className="adm-avatar">{initials}</span>
          <div className="adm-side__who">
            <strong>{adminName || "Admin"}</strong>
            <span>{isSuperAdmin ? "Super Admin" : "Admin"}</span>
          </div>
          <button type="button" className="adm-icon-btn" onClick={signOut} title="Sign out" aria-label="Sign out">
            <FaSignOutAlt />
          </button>
        </div>
      </aside>

      <div className="adm-scrim" onClick={() => setOpen(false)} aria-hidden="true" />

      <div className="adm-main">
        <header className="adm-top">
          <button type="button" className="adm-icon-btn adm-top__menu" onClick={() => setOpen(true)} aria-label="Open menu">
            <FaBars />
          </button>
          <span className="adm-top__hint">
            <FaUsers aria-hidden="true" /> Changes save to the database and appear on the live website straight away.
          </span>
          <a className="adm-btn adm-btn--ghost" href={publicSiteUrl()} target="_blank" rel="noreferrer">
            <FaExternalLinkAlt /> View website
          </a>
        </header>

        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
