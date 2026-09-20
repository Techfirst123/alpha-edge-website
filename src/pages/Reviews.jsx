import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaStar,
  FaRegStar,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

import {
  getReviewsPage,
  getRatingsSummary,
} from "../api/client";

import { placeholderTestimonials } from "../data/placeholder";
import { formatDate } from "../utils/formatDate";

import "./Reviews.css";

const REVIEWS_PER_PAGE = 10;


/* =========================================================
   FALLBACK SUMMARY
========================================================= */

function fallbackSummary() {
  const counts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let sum = 0;

  placeholderTestimonials.forEach((t) => {
    const rating = t.rating || 5;

    counts[rating] = (counts[rating] || 0) + 1;
    sum += rating;
  });

  const total = placeholderTestimonials.length;

  return {
    average: total
      ? Math.round((sum / total) * 10) / 10
      : 0,
    total,
    counts,
  };
}


/* =========================================================
   FALLBACK REVIEWS
========================================================= */

function fallbackReviews() {
  return placeholderTestimonials.map((t) => ({
    id: t.id,
    name: t.client_name,
    rating: t.rating || 5,
    feedback: t.quote,
    createdAt: null,
  }));
}


/* =========================================================
   STARS
========================================================= */

function Stars({ value }) {
  return (
    <span
      className="reviews-stars"
      aria-label={`${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) =>
        i < Math.round(value) ? (
          <FaStar key={i} />
        ) : (
          <FaRegStar key={i} />
        )
      )}
    </span>
  );
}


/* =========================================================
   REVIEW CARD
========================================================= */

function ReviewCard({ review }) {
  const firstLetter =
    review.name?.trim()?.charAt(0)?.toUpperCase() || "C";

  return (
    <article className="reviews-page__card">

      <div className="reviews-page__card-top">

        <div className="reviews-page__rating">

          <Stars value={review.rating} />

          <span>
            {Number(review.rating || 0).toFixed(1)}
          </span>

        </div>

        {review.createdAt && (
          <span className="reviews-page__date">
            {formatDate(review.createdAt)}
          </span>
        )}

      </div>


      <div className="reviews-page__quote">
        “
      </div>


      <p className="reviews-page__feedback">
        {review.feedback}
      </p>


      <div className="reviews-page__author">

        <span className="reviews-page__avatar">
          {firstLetter}
        </span>

        <div>

          <strong>
            {review.name}
          </strong>

          <span>
            Client Feedback
          </span>

        </div>

      </div>

    </article>
  );
}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function Reviews() {

  const [reviews, setReviews] = useState(
    fallbackReviews().slice(0, REVIEWS_PER_PAGE)
  );

  const [summary, setSummary] = useState(
    fallbackSummary
  );

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(
    Math.max(
      1,
      Math.ceil(
        placeholderTestimonials.length /
          REVIEWS_PER_PAGE
      )
    )
  );

  const [total, setTotal] = useState(
    placeholderTestimonials.length
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(false);


  /* =======================================================
     LOAD REVIEWS
  ======================================================= */

  const loadReviews = async (pageNumber) => {

    setLoading(true);
    setError(false);

    try {

      const data = await getReviewsPage(
        pageNumber,
        REVIEWS_PER_PAGE
      );

      setReviews(data.reviews);

      setPage(data.page);

      setTotal(data.total);

      setTotalPages(data.totalPages);

    } catch (err) {

      console.error("Failed to load reviews:", err);

      /*
       * If API fails, keep fallback reviews.
       * This prevents the page from looking completely broken.
       */
      if (pageNumber === 1) {

        setReviews(
          fallbackReviews().slice(
            0,
            REVIEWS_PER_PAGE
          )
        );

      }

      setError(true);

    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     LOAD SUMMARY + FIRST PAGE
  ======================================================= */

  useEffect(() => {

    getRatingsSummary()
      .then((data) => {

        if (data) {
          setSummary(data);
        }

      })
      .catch(() => {
        // Keep fallback summary.
      });


    loadReviews(1);

  }, []);


  /* =======================================================
     CHANGE PAGE
  ======================================================= */

  const changePage = (pageNumber) => {

    if (
      pageNumber < 1 ||
      pageNumber > totalPages ||
      pageNumber === page
    ) {
      return;
    }

    loadReviews(pageNumber);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  /* =======================================================
     PAGE NUMBERS
  ======================================================= */

  const getPageNumbers = () => {

    const pages = [];

    if (totalPages <= 7) {

      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }


    pages.push(1);


    if (page > 3) {
      pages.push("ellipsis-start");
    }


    const start = Math.max(2, page - 1);

    const end = Math.min(
      totalPages - 1,
      page + 1
    );


    for (let i = start; i <= end; i++) {

      if (!pages.includes(i)) {
        pages.push(i);
      }

    }


    if (page < totalPages - 2) {
      pages.push("ellipsis-end");
    }


    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }


    return pages;
  };


  return (

    <main className="reviews-page">


      {/* =================================================
          HERO
      ================================================= */}

      <section className="reviews-page__hero">

        <div className="container">

          <span className="eyebrow">
            Client Success
          </span>

          <h1>
            What Our Clients Say
          </h1>

          <p>
            Explore feedback from the people and teams
            who have worked with Alpha Edge.
          </p>

          <div className="reviews-page__hero-links">

            <Link
              to="/"
              className="reviews-page__back"
            >
              <FaArrowLeft />
              Back to Home
            </Link>

          </div>

        </div>

      </section>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <section className="reviews-page__summary">

        <div className="container">

          <div className="reviews-page__summary-card">


            <div className="reviews-page__summary-main">

              <span className="reviews-page__summary-label">
                Overall Rating
              </span>

              <div className="reviews-page__summary-rating">

                <strong>
                  {Number(summary.average || 0).toFixed(1)}
                </strong>

                <div>

                  <Stars value={summary.average} />

                  <span>
                    Based on {summary.total}{" "}
                    {summary.total === 1
                      ? "review"
                      : "reviews"}
                  </span>

                </div>

              </div>

            </div>


            <div className="reviews-page__summary-divider" />


            <div className="reviews-page__summary-stat">

              <strong>
                {total}
              </strong>

              <span>
                Client Reviews
              </span>

            </div>


            <div className="reviews-page__summary-divider" />


            <div className="reviews-page__summary-stat">

              <strong>
                5★
              </strong>

              <span>
                Rating Experience
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          REVIEWS
      ================================================= */}

      <section className="reviews-page__content">

        <div className="container">


          <div className="reviews-page__heading">

            <div>

              <span className="eyebrow">
                Client Feedback
              </span>

              <h2>
                Experiences That Matter
              </h2>

            </div>


            <span className="reviews-page__count">

              Showing{" "}
              {reviews.length
                ? (page - 1) *
                    REVIEWS_PER_PAGE +
                  1
                : 0}
              {" — "}
              {Math.min(
                page * REVIEWS_PER_PAGE,
                total
              )}{" "}
              of {total}

            </span>

          </div>


          {/* Loading */}

          {loading && (

            <div className="reviews-page__loading">

              <span className="reviews-page__spinner" />

              <p>
                Loading client reviews...
              </p>

            </div>

          )}


          {/* Review Grid */}

          {!loading && reviews.length > 0 && (

            <div className="reviews-page__grid">

              {reviews.map((review) => (

                <ReviewCard
                  key={review.id}
                  review={review}
                />

              ))}

            </div>

          )}


          {/* Empty */}

          {!loading && reviews.length === 0 && (

            <div className="reviews-page__empty">

              <h3>
                No reviews yet
              </h3>

              <p>
                Be the first to share your experience
                with Alpha Edge.
              </p>

              <Link
                to="/#reviews"
                className="btn btn-primary"
              >
                Share Your Feedback
              </Link>

            </div>

          )}


          {/* Error */}

          {error && (

            <p className="reviews-page__notice">
              Showing available client feedback.
            </p>

          )}


          {/* =================================================
              PAGINATION
          ================================================= */}

          {totalPages > 1 && (

            <div className="reviews-page__pagination">

              <button
                type="button"
                className="reviews-page__page-btn reviews-page__page-btn--arrow"
                onClick={() =>
                  changePage(page - 1)
                }
                disabled={
                  page === 1 || loading
                }
                aria-label="Previous page"
              >
                <FaArrowLeft />
              </button>


              <div className="reviews-page__page-numbers">

                {getPageNumbers().map(
                  (item) => {

                    if (
                      typeof item === "string"
                    ) {

                      return (
                        <span
                          key={item}
                          className="reviews-page__ellipsis"
                        >
                          …
                        </span>
                      );

                    }


                    return (

                      <button
                        key={item}
                        type="button"
                        className={`reviews-page__page-btn ${
                          item === page
                            ? "reviews-page__page-btn--active"
                            : ""
                        }`}
                        onClick={() =>
                          changePage(item)
                        }
                        disabled={loading}
                        aria-current={
                          item === page
                            ? "page"
                            : undefined
                        }
                      >
                        {item}
                      </button>

                    );

                  }
                )}

              </div>


              <button
                type="button"
                className="reviews-page__page-btn reviews-page__page-btn--arrow"
                onClick={() =>
                  changePage(page + 1)
                }
                disabled={
                  page === totalPages ||
                  loading
                }
                aria-label="Next page"
              >
                <FaArrowRight />
              </button>

            </div>

          )}

        </div>

      </section>


      {/* =================================================
          CTA
      ================================================= */}

      <section className="reviews-page__cta">

        <div className="container">

          <div>

            <span className="eyebrow">
              Your Experience Matters
            </span>

            <h2>
              Worked with Alpha Edge?
            </h2>

            <p>
              Share your experience and help others
              understand what it&rsquo;s like to work
              with our team.
            </p>

          </div>

          <Link
            to="/#reviews"
            className="btn btn-primary"
          >
            Share Your Feedback
            <FaArrowRight />
          </Link>

        </div>

      </section>

    </main>

  );
}
