import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers, FaClock, FaEye, FaExternalLinkAlt, FaGlobe,
  FaStar, FaBoxes, FaTags, FaCopyright, FaCommentDots,
  FaChevronDown, FaChevronUp, FaUserShield, FaEdit,
} from "react-icons/fa";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { getAnalytics, adminGetRatings, adminGetProductStats } from "../api/client";
import { formatDate, formatTime as formatClockTime } from "../utils/formatDate";
import { CONTENT_SECTIONS } from "../data/contentSections";
import NotFound from "./NotFound";
import Layout from "../components/Layout";
import AdminManagementModal from "../components/AdminManagementModal";
import "./Dashboard.css";

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs ? `${mins}m ${secs}s` : `${mins}m`;
}

function formatTime(iso) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function referrerHost(referrer) {
  try {
    return new URL(referrer).hostname;
  } catch {
    return referrer;
  }
}

function Stars({ value }) {
  return (
    <span className="dash-rating-stars" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar key={i} className={i < value ? "" : "dash-rating-stars__empty"} />
      ))}
    </span>
  );
}

export default function Dashboard() {
  const { isAdmin, isSuperAdmin, ready } = useAdminAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState(null);
  const [ratingsError, setRatingsError] = useState("");
  const [productStats, setProductStats] = useState(null);
  const [productStatsError, setProductStatsError] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [showAdminMgmt, setShowAdminMgmt] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    getAnalytics()
      .then(setData)
      .catch((err) => setError(err?.response?.data?.error || "Failed to load analytics"));
    adminGetRatings()
      .then(setRatings)
      .catch((err) => setRatingsError(err?.response?.data?.error || "Failed to load ratings"));
    adminGetProductStats()
      .then(setProductStats)
      .catch((err) => setProductStatsError(err?.response?.data?.error || "Failed to load product stats"));
  }, [isAdmin]);

  // Not logged in: show a plain 404 (with the normal site navbar/footer), not
  // a redirect — direct URL guesses at /admin/dashboard shouldn't reveal that
  // an admin area exists here.
  if (ready && !isAdmin) return <Layout><NotFound /></Layout>;
  if (!ready) return null;

  return (
    <div className="dashboard-page">
      <div className="container">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Site activity, ratings and catalog overview — visible to admins only.</p>
          </div>
          <div className="dashboard-header__actions">
            {isSuperAdmin && (
              <button
                type="button"
                className="dashboard-header__admin-mgmt"
                title="Manage Admin"
                aria-label="Manage Admin"
                onClick={() => setShowAdminMgmt(true)}
              >
                <FaUserShield /> <span>Manage Admin</span>
              </button>
            )}
            {/* Takes the admin to the normal site, still fully logged in — the
                edit icons and everything else stay available there. */}
            <Link to="/" className="dashboard-header__view-site" title="View Site" aria-label="View Site">
              <FaGlobe />
            </Link>
          </div>
        </header>

        <section className="dash-section">
          <h2 className="dash-section__title">Product Overview</h2>
          {productStatsError && <p className="dash-error">{productStatsError}</p>}
          {!productStats && !productStatsError && <p className="dash-loading">Loading…</p>}
          {productStats && (
            <div className="dash-overview-grid">
              <div className="dash-overview-card">
                <span className="dash-overview-card__icon dash-overview-card__icon--products">
                  <FaBoxes />
                </span>
                <span className="dash-overview-card__label">Total Products</span>
                <span className="dash-overview-card__n">{productStats.totalProducts}</span>
              </div>

              <div className="dash-overview-card">
                <span className="dash-overview-card__icon dash-overview-card__icon--categories">
                  <FaTags />
                </span>
                <span className="dash-overview-card__label">Categories</span>
                <span className="dash-overview-card__n">{productStats.categories.length}</span>
                {productStats.categories.length > 0 && (
                  <button
                    type="button"
                    className="dash-overview-card__toggle"
                    onClick={() => setCategoriesOpen((v) => !v)}
                    aria-expanded={categoriesOpen}
                  >
                    {categoriesOpen ? "Hide list" : "Show list"}
                    {categoriesOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                )}
                <div className={`dash-overview-card__panel ${categoriesOpen ? "dash-overview-card__panel--open" : ""}`}>
                  <ul className="dash-overview-card__tags">
                    {productStats.categories.map((c) => (
                      <li key={c.key}>{c.label} <span>{c.count}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="dash-overview-card">
                <span className="dash-overview-card__icon dash-overview-card__icon--brands">
                  <FaCopyright />
                </span>
                <span className="dash-overview-card__label">Brands</span>
                <span className="dash-overview-card__n">{productStats.brands.length}</span>
                {productStats.brands.length > 0 && (
                  <button
                    type="button"
                    className="dash-overview-card__toggle"
                    onClick={() => setBrandsOpen((v) => !v)}
                    aria-expanded={brandsOpen}
                  >
                    {brandsOpen ? "Hide list" : "Show list"}
                    {brandsOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                )}
                <div className={`dash-overview-card__panel ${brandsOpen ? "dash-overview-card__panel--open" : ""}`}>
                  <ul className="dash-overview-card__tags dash-overview-card__tags--brands">
                    {productStats.brands.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="dash-section">
          <h2 className="dash-section__title">Website Content</h2>
          <p className="dash-section__hint">
            Edit text, images and photos directly on the live page using the pencil icon that appears
            over each editable section when you&rsquo;re signed in as admin.
          </p>
          <div className="dash-content-grid">
            {CONTENT_SECTIONS.map((page) => (
              <div className="dash-content-card" key={page.page}>
                <div className="dash-content-card__head">
                  <h3>{page.page}</h3>
                  <Link to={page.path} className="dash-content-card__link">
                    <FaEdit /> Manage
                  </Link>
                </div>
                <ul>
                  {page.sections.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="dash-section">
          <h2 className="dash-section__title">Ratings &amp; Feedback</h2>
          {ratingsError && <p className="dash-error">{ratingsError}</p>}
          {!ratings && !ratingsError && <p className="dash-loading">Loading…</p>}
          {ratings && (
            <>
              <div className="dash-stats">
                <div className="dash-stat">
                  <FaStar />
                  <div>
                    <span className="dash-stat__n">{ratings.summary.average.toFixed(1)}</span>
                    <span className="dash-stat__label">Average Rating</span>
                  </div>
                </div>
                <div className="dash-stat">
                  <FaCommentDots />
                  <div>
                    <span className="dash-stat__n">{ratings.summary.total}</span>
                    <span className="dash-stat__label">Total Ratings</span>
                  </div>
                </div>
                <div className="dash-stat">
                  <FaCommentDots />
                  <div>
                    <span className="dash-stat__n">{ratings.reviews.length}</span>
                    <span className="dash-stat__label">Total Feedback</span>
                  </div>
                </div>
                {[5, 4, 3, 2, 1].map((n) => (
                  <div className="dash-stat dash-stat--compact" key={n}>
                    <div>
                      <span className="dash-stat__n">{ratings.summary.counts[n] || 0}</span>
                      <span className="dash-stat__label">{n} Star{n > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                ))}
              </div>

              {ratings.reviews.length === 0 ? (
                <p className="dash-empty">No ratings or feedback submitted yet.</p>
              ) : (
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Rating</th>
                        <th>Feedback</th>
                        <th>Date</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ratings.reviews.map((r) => (
                        <tr key={r.id}>
                          <td>{r.name}</td>
                          <td><Stars value={r.rating} /></td>
                          <td className="dash-table__feedback">{r.feedback}</td>
                          <td>{r.createdAt ? formatDate(r.createdAt) : "—"}</td>
                          <td>{r.createdAt ? formatClockTime(r.createdAt) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>

        <section className="dash-section">
          <h2 className="dash-section__title">Visitor Activity</h2>

        {error && <p className="dash-error">{error}</p>}
        {!data && !error && <p className="dash-loading">Loading…</p>}

        {data && (
          <>
            <div className="dash-stats">
              <div className="dash-stat">
                <FaUsers />
                <div>
                  <span className="dash-stat__n">{data.totals.uniqueVisitors}</span>
                  <span className="dash-stat__label">Unique Visitors</span>
                </div>
              </div>
              <div className="dash-stat">
                <FaEye />
                <div>
                  <span className="dash-stat__n">{data.totals.totalSessions}</span>
                  <span className="dash-stat__label">Visits (Sessions)</span>
                </div>
              </div>
            </div>

            {data.sessions.length === 0 ? (
              <p className="dash-empty">No visits recorded yet.</p>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Visitor</th>
                      <th>Arrived</th>
                      <th>Last Active</th>
                      <th><FaClock aria-hidden="true" /> Time on Site</th>
                      <th>Pages Viewed</th>
                      <th>Came From</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sessions.map((s) => (
                      <tr key={s.sessionId}>
                        <td className="dash-table__mono">{s.visitorId.slice(0, 8)}</td>
                        <td>{formatTime(s.firstSeen)}</td>
                        <td>{formatTime(s.lastSeen)}</td>
                        <td>{formatDuration(s.secondsOnSite)}</td>
                        <td>
                          <div className="dash-pages">
                            {s.pages.map((p) => (
                              <span className="dash-page-chip" key={p}>
                                {p === "/" ? "Home" : p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="dash-table__referrer">
                          {s.referrer === "Direct" || !s.referrer ? (
                            "Direct"
                          ) : (
                            <a href={s.referrer} target="_blank" rel="noopener noreferrer">
                              {referrerHost(s.referrer)}
                              <FaExternalLinkAlt aria-hidden="true" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        </section>
      </div>

      {showAdminMgmt && isSuperAdmin && (
        <AdminManagementModal onClose={() => setShowAdminMgmt(false)} />
      )}
    </div>
  );
}
