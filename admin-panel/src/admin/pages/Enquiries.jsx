import { useEffect, useMemo, useState } from "react";
import { FaEnvelope, FaEnvelopeOpenText, FaPhoneAlt, FaSearch, FaTrashAlt } from "react-icons/fa";
import { deleteLead, errorText, getLeads, setLeadStatus } from "../api";
import { Badge, Button, Card, ConfirmModal, Empty, ErrorNote, Loading, PageHeader, useToast } from "../ui";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "done", label: "Done" },
];

const STATUS_TONE = { new: "amber", read: "blue", done: "green" };

function when(d) {
  if (!d) return "";
  return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function Enquiries() {
  const toast = useToast();
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    getLeads().then(setLeads).catch((e) => setError(errorText(e, "Failed to load enquiries")));
  }, []);

  const shown = useMemo(() => {
    if (!leads) return [];
    const term = q.trim().toLowerCase();
    return leads.filter(
      (l) =>
        (filter === "all" || l.status === filter) &&
        (!term || [l.name, l.email, l.company, l.subject, l.message].some((v) => String(v || "").toLowerCase().includes(term)))
    );
  }, [leads, filter, q]);

  const selected = leads?.find((l) => l.id === selectedId) || null;

  const changeStatus = async (lead, status) => {
    try {
      await setLeadStatus(lead.id, status);
      setLeads((all) => all.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    } catch (e) {
      toast(errorText(e, "Could not update"), "error");
    }
  };

  const open = (lead) => {
    setSelectedId(lead.id);
    if (lead.status === "new") changeStatus(lead, "read");
  };

  const counts = useMemo(() => {
    const c = { all: leads?.length || 0, new: 0, read: 0, done: 0 };
    leads?.forEach((l) => (c[l.status] = (c[l.status] || 0) + 1));
    return c;
  }, [leads]);

  return (
    <>
      <PageHeader title="Enquiries" subtitle="Messages from the Contact and Get a Quote forms." />
      <ErrorNote>{error}</ErrorNote>
      {!leads && !error && <Loading />}

      {leads && (
        <div className="adm-inbox">
          <Card className="adm-inbox__list">
            <div className="adm-toolbar">
              <div className="adm-tabs">
                {FILTERS.map((f) => (
                  <button key={f.key} type="button" className={filter === f.key ? "is-active" : ""} onClick={() => setFilter(f.key)}>
                    {f.label} <span>{counts[f.key] || 0}</span>
                  </button>
                ))}
              </div>
              <label className="adm-search">
                <FaSearch aria-hidden="true" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, message…" />
              </label>
            </div>

            {shown.length === 0 ? (
              <Empty icon={<FaEnvelopeOpenText />} title="Nothing here">No enquiries match this filter.</Empty>
            ) : (
              <ul className="adm-inbox__items">
                {shown.map((l) => (
                  <li key={l.id}>
                    <button type="button" className={`adm-inbox__item ${l.id === selectedId ? "is-active" : ""} ${l.status === "new" ? "is-new" : ""}`} onClick={() => open(l)}>
                      <span className="adm-inbox__row">
                        <strong>{l.name}</strong>
                        <time>{when(l.created_at)}</time>
                      </span>
                      <span className="adm-inbox__subject">{l.subject || l.service_interest || "General enquiry"}</span>
                      <span className="adm-inbox__preview">{l.message}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="adm-inbox__detail">
            {!selected ? (
              <Empty icon={<FaEnvelope />} title="Select an enquiry">Pick a message on the left to read it.</Empty>
            ) : (
              <div className="adm-lead">
                <div className="adm-lead__head">
                  <div>
                    <h2>{selected.subject || selected.service_interest || "General enquiry"}</h2>
                    <p>
                      From <strong>{selected.name}</strong>
                      {selected.company ? ` · ${selected.company}` : ""} · {when(selected.created_at)}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>
                </div>

                <div className="adm-lead__contact">
                  <a href={`mailto:${selected.email}`}>
                    <FaEnvelope /> {selected.email}
                  </a>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`}>
                      <FaPhoneAlt /> {selected.phone}
                    </a>
                  )}
                </div>

                <dl className="adm-lead__meta">
                  {selected.service_interest && (
                    <>
                      <dt>Interested in</dt>
                      <dd>{selected.service_interest}</dd>
                    </>
                  )}
                  {selected.budget && (
                    <>
                      <dt>Budget</dt>
                      <dd>{selected.budget}</dd>
                    </>
                  )}
                  {selected.source_page && (
                    <>
                      <dt>Sent from</dt>
                      <dd>{selected.source_page}</dd>
                    </>
                  )}
                </dl>

                <p className="adm-lead__message">{selected.message}</p>

                <div className="adm-lead__actions">
                  <a className="adm-btn adm-btn--accent" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || "Your enquiry"}`)}`}>
                    <FaEnvelope /> Reply by email
                  </a>
                  {selected.status !== "done" ? (
                    <Button variant="ghost" onClick={() => changeStatus(selected, "done")}>Mark as done</Button>
                  ) : (
                    <Button variant="ghost" onClick={() => changeStatus(selected, "read")}>Reopen</Button>
                  )}
                  <Button variant="danger-ghost" onClick={() => setConfirm(selected)}>
                    <FaTrashAlt /> Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title="Delete this enquiry?"
          message={`The message from ${confirm.name} will be removed permanently.`}
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            await deleteLead(confirm.id);
            setLeads((all) => all.filter((l) => l.id !== confirm.id));
            setSelectedId(null);
            toast("Enquiry deleted");
          }}
        />
      )}
    </>
  );
}
