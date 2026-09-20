import useVisitorTracking from "../hooks/useVisitorTracking";

// Mounted once inside <BrowserRouter> — records anonymous page views/time
// on site (only once cookies are accepted) for the admin-only /details page.
export default function VisitorTracker() {
  useVisitorTracking();
  return null;
}
