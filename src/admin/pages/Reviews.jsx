import { useEffect, useMemo, useState } from "react";
import { FaCommentDots, FaStar, FaTrashAlt } from "react-icons/fa";
import { formatDate } from "../../utils/formatDate";
import { adminGetRatings, deleteReview, errorText } from "../api";
import { Card, ConfirmModal, Empty, ErrorNote, Loading, PageHeader, useToast } from "../ui";

function Stars({ value }) {
  return (
    <span className="adm-stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <FaStar key={n} className={n <= value ? "is-on" : ""} />
      ))}
    </span>
  );
}

export default function Reviews() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [stars, setStars] = useState(0);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    adminGetRatings().then(setData).catch((e) => setError(errorText(e, "Failed to load reviews")));
  }, []);

  const shown = useMemo(() => (data ? data.reviews.filter((r) => !stars || r.rating === stars) : []), [data, stars]);

  return (
    <>
      <PageHeader title="Reviews" subtitle="Ratings and feedback visitors have left on the website. Delete spam or test entries here." />
      <ErrorNote>{error}</ErrorNote>
      {!data && !error && <Loading />}
      {data && (
        <>
          <div className="adm-rating-summary">
            <Card className="adm-rating-summary__score">
              <span className="adm-rating-summary__big">{data.summary.average.toFixed(1)}</span>
              <Stars value={Math.round(data.summary.average)} />
              <span className="adm-muted">{data.summary.total} ratings</span>
            </Card>
            <Card className="adm-rating-summary__bars">
              {[5, 4, 3, 2, 1].map((n) => {
                const count = data.summary.counts[n] || 0;
                const pct = data.summary.total ? (count / data.summary.total) * 100 : 0;
                return (
                  <button type="button" key={n} className={`adm-bar ${stars === n ? "is-active" : ""}`} onClick={() => setStars(stars === n ? 0 : n)}>
                    <span>{n} <FaStar /></span>
                    <span className="adm-bar__track"><span style={{ width: `${pct}%` }} /></span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </Card>
          </div>

          <Card title={stars ? `${stars}-star reviews` : "All reviews"} subtitle={stars ? "Click the bar again to show all" : "Click a bar above to filter"}>
            {shown.length === 0 ? (
              <Empty icon={<FaCommentDots />} title="No reviews" />
            ) : (
              <ul className="adm-reviews">
                {shown.map((r) => (
                  <li key={r.id}>
                    <div className="adm-reviews__head">
                      <strong>{r.name}</strong>
                      <Stars value={r.rating} />
                      <time>{formatDate(r.createdAt)}</time>
                      <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => setConfirm(r)} aria-label="Delete review">
                        <FaTrashAlt />
                      </button>
                    </div>
                    {r.feedback && <p>{r.feedback}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
      {confirm && (
        <ConfirmModal
          title="Delete this review?"
          message={`${confirm.name}'s ${confirm.rating}-star review will be removed from the website.`}
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            await deleteReview(confirm.id);
            const d = await adminGetRatings();
            setData(d);
            toast("Review deleted");
          }}
        />
      )}
    </>
  );
}
