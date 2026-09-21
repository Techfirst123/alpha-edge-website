import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBoxes,
  FaCog,
  FaEnvelopeOpenText,
  FaEye,
  FaPhotoVideo,
  FaStar,
  FaTools,
  FaUsers,
} from "react-icons/fa";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { adminGetProductStats, adminGetRatings, getAnalytics, getLeads } from "../api";
import { Badge, Card, Empty, PageHeader } from "../ui";

function Stat({ icon, label, value, to, tone }) {
  const body = (
    <>
      <span className={`adm-stat__icon adm-stat__icon--${tone}`}>{icon}</span>
      <span className="adm-stat__label">{label}</span>
      <span className="adm-stat__value">{value ?? "—"}</span>
    </>
  );
  return to ? (
    <Link to={to} className="adm-stat adm-stat--link">
      {body}
    </Link>
  ) : (
    <div className="adm-stat">{body}</div>
  );
}

const SHORTCUTS = [
  { to: "/admin/hero", icon: <FaPhotoVideo />, title: "Hero slides", text: "Home page banner images and headlines" },
  { to: "/admin/products", icon: <FaBoxes />, title: "Products", text: "Add, edit, import from Excel, pick Top 10" },
  { to: "/admin/services", icon: <FaTools />, title: "Services", text: "What We Do cards and the quote form list" },
  { to: "/admin/settings", icon: <FaCog />, title: "Site settings", text: "Phone, email, address, social links" },
];

export default function Overview() {
  const { adminName } = useAdminAuth();
  const [stats, setStats] = useState({});
  const [leads, setLeads] = useState(null);

  useEffect(() => {
    adminGetProductStats().then((d) => setStats((s) => ({ ...s, products: d.totalProducts, brands: d.brands.length }))).catch(() => {});
    adminGetRatings().then((d) => setStats((s) => ({ ...s, rating: d.summary.average, reviews: d.summary.total }))).catch(() => {});
    getAnalytics().then((d) => setStats((s) => ({ ...s, visitors: d.totals.uniqueVisitors, visits: d.totals.totalSessions }))).catch(() => {});
    getLeads().then(setLeads).catch(() => setLeads([]));
  }, []);

  const newCount = leads ? leads.filter((l) => l.status === "new").length : undefined;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader title={`${greeting}${adminName ? `, ${adminName.split(" ")[0]}` : ""}`} subtitle="Here's what's happening on your website." />

      <div className="adm-stats">
        <Stat icon={<FaEnvelopeOpenText />} label="New enquiries" value={newCount} to="/admin/enquiries" tone="amber" />
        <Stat icon={<FaBoxes />} label="Products" value={stats.products} to="/admin/products" tone="blue" />
        <Stat icon={<FaStar />} label="Average rating" value={stats.rating !== undefined ? `${stats.rating.toFixed(1)} / 5` : undefined} to="/admin/reviews" tone="green" />
        <Stat icon={<FaUsers />} label="Unique visitors" value={stats.visitors} to="/admin/visitors" tone="violet" />
      </div>

      <div className="adm-grid-2">
        <Card
          title="Latest enquiries"
          actions={
            <Link to="/admin/enquiries" className="adm-link">
              View all <FaArrowRight />
            </Link>
          }
        >
          {leads && leads.length === 0 && <Empty icon={<FaEnvelopeOpenText />} title="No enquiries yet">Contact and quote form submissions will appear here.</Empty>}
          {leads && leads.length > 0 && (
            <ul className="adm-mini-list">
              {leads.slice(0, 5).map((l) => (
                <li key={l.id}>
                  <div>
                    <strong>{l.name}</strong>
                    <span>{l.subject || l.service_interest || l.message}</span>
                  </div>
                  {l.status === "new" ? <Badge tone="amber">New</Badge> : <Badge>{l.status}</Badge>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Quick edit">
          <div className="adm-shortcuts">
            {SHORTCUTS.map((s) => (
              <Link key={s.to} to={s.to} className="adm-shortcut">
                <span className="adm-shortcut__icon">{s.icon}</span>
                <span>
                  <strong>{s.title}</strong>
                  <small>{s.text}</small>
                </span>
                <FaArrowRight className="adm-shortcut__go" />
              </Link>
            ))}
          </div>
          <p className="adm-muted adm-mt">
            <FaEye /> {stats.visits ?? "—"} visits recorded · {stats.reviews ?? "—"} reviews · {stats.brands ?? "—"} brands in the catalogue
          </p>
        </Card>
      </div>
    </>
  );
}
