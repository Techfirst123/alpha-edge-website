export const COOKIE_CONSENT_STORAGE_KEY = "alphaedge_cookie_consent";

// Reads the visitor's saved cookie choice, if any: "accepted" | "rejected" | null.
export function getCookieConsent() {
  try {
    const saved = JSON.parse(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) || "null");
    return saved?.choice ?? null;
  } catch {
    return null;
  }
}
