import { useEffect, useState } from "react";
import { FaChartLine, FaExternalLinkAlt } from "react-icons/fa";
import { errorText, getAnalytics } from "../api";
import { Card, Empty, ErrorNote, Loading, PageHeader } from "../ui";

function duration(s) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return s % 60 ? `${m}m ${s % 60}s` : `${m}m`;
}
const when = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
const host = (r) => {
  try {
    return new URL(r).hostname;
  } catch {
    return r;
  }
};

export default function Visitors() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalytics().then(setData).catch((e) => setError(errorText(e, "Failed to load analytics")));
  }, []);

  return (
    <>
      <PageHeader title="Visitors" subtitle="Visits from people who accepted analytics cookies." />
      <ErrorNote>{error}</ErrorNote>
      {!data && !error && <Loading />}
      {data && (
        <>
          <div className="adm-stats adm-stats--2">
            <div className="adm-stat">
              <span className="adm-stat__label">Unique visitors</span>
              <span className="adm-stat__value">{data.totals.uniqueVisitors}</span>
            </div>
            <div className="adm-stat">
              <span className="adm-stat__label">Visits</span>
              <span className="adm-stat__value">{data.totals.totalSessions}</span>
            </div>
          </div>
          <Card title="Recent visits">
            {data.sessions.length === 0 ? (
              <Empty icon={<FaChartLine />} title="No visits recorded yet" />
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Visitor</th>
                      <th>Arrived</th>
                      <th>Time on site</th>
                      <th>Pages</th>
                      <th>Came from</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sessions.map((s) => (
                      <tr key={s.sessionId}>
                        <td className="adm-mono">{s.visitorId.slice(0, 8)}</td>
                        <td>{when(s.firstSeen)}</td>
                        <td>{duration(s.secondsOnSite)}</td>
                        <td>
                          <div className="adm-chips">
                            {s.pages.map((p) => (
                              <span key={p} className="adm-chip adm-chip--static">{p === "/" ? "Home" : p}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          {!s.referrer || s.referrer === "Direct" ? (
                            "Direct"
                          ) : (
                            <a className="adm-link" href={s.referrer} target="_blank" rel="noopener noreferrer">
                              {host(s.referrer)} <FaExternalLinkAlt />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </>
  );
}
