import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent } from "../api/client";
import { getCookieConsent } from "../utils/cookieConsent";

const HEARTBEAT_MS = 15000; // must match HEARTBEAT_SECONDS in api/admin/analytics.js

function getOrCreateId(storage, key) {
  try {
    let id = storage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      storage.setItem(key, id);
    }
    return id;
  } catch {
    return crypto.randomUUID(); // storage unavailable (private mode, etc.)
  }
}

function ids() {
  return {
    visitorId: getOrCreateId(localStorage, "alphaedge_visitor_id"),
    sessionId: getOrCreateId(sessionStorage, "alphaedge_session_id"),
  };
}

// Records anonymous page views + time-on-site for the admin-only /details
// report — only once the visitor has accepted cookies. No personal data:
// just a random id per browser and per browser-session.
// Admin panel pages are never counted as visits.
const isAdminPath = (path) => path === "/admin" || path.startsWith("/admin/");

export default function useVisitorTracking() {
  const location = useLocation();
  const pathRef = useRef(location.pathname);

  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (getCookieConsent() !== "accepted" || isAdminPath(location.pathname)) return;
    const { visitorId, sessionId } = ids();
    trackEvent({
      type: "pageview",
      sessionId,
      visitorId,
      path: location.pathname,
      referrer: document.referrer || "",
    }).catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    const sendPageview = () => {
      if (getCookieConsent() !== "accepted" || isAdminPath(pathRef.current)) return;
      const { visitorId, sessionId } = ids();
      trackEvent({
        type: "pageview",
        sessionId,
        visitorId,
        path: pathRef.current,
        referrer: document.referrer || "",
      }).catch(() => {});
    };
    // Consent can be accepted mid-visit (banner click) — start tracking
    // immediately rather than waiting for the next navigation.
    window.addEventListener("cookieconsentchange", sendPageview);
    return () => window.removeEventListener("cookieconsentchange", sendPageview);
  }, []);

  useEffect(() => {
    const ping = () => {
      if (document.visibilityState !== "visible") return;
      if (getCookieConsent() !== "accepted" || isAdminPath(pathRef.current)) return;
      const { visitorId, sessionId } = ids();
      trackEvent({ type: "heartbeat", sessionId, visitorId, path: pathRef.current }).catch(() => {});
    };
    const interval = setInterval(ping, HEARTBEAT_MS);
    return () => clearInterval(interval);
  }, []);
}
