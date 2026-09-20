// Shared date/time formatting for anything showing a stored timestamp
// (reviews on the home page, the admin ratings table) — renders in the
// viewer's own locale/timezone from the UTC instant stored in MongoDB.
export function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(undefined, { timeStyle: "short" });
}
