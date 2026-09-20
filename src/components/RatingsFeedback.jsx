import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaStar,
  FaRegStar,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

import {
  getHomepageReviews,
  getRatingsSummary,
  submitRating,
} from "../api/client";

import { placeholderTestimonials } from "../data/placeholder";
import { formatDate } from "../utils/formatDate";

import "./RatingsFeedback.css";

const MAX_NAME = 80;
const MAX_FEEDBACK = 1000;
const HOMEPAGE_REVIEW_LIMIT = 6;


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
  return placeholderTestimonials
    .slice(0, HOMEPAGE_REVIEW_LIMIT)
    .map((t) => ({
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
      className="ratings-stars"
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
   STAR PICKER
========================================================= */

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div
      className="star-picker"
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="star-picker__btn"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          {n <= (hover || value) ? (
            <FaStar />
          ) : (
            <FaRegStar />
          )}
        </button>
      ))}
    </div>
  );
}


/* =========================================================
   REVIEW CARD
========================================================= */

function ReviewCard({ review }) {
  const hasDate = Boolean(review.createdAt);

  const firstLetter =
    review.name?.trim()?.charAt(0)?.toUpperCase() || "C";

  return (
    <article className="review-card">

      <div className="review-card__top">

        <div className="review-card__stars">

          <Stars value={review.rating} />

          <span className="review-card__rating">
            {Number(review.rating || 0).toFixed(1)}
          </span>

        </div>

        {hasDate && (
          <span className="review-card__when">
            {formatDate(review.createdAt)}
          </span>
        )}

      </div>


      <div className="review-card__quote-mark">
        “
      </div>


      <p className="review-card__text">
        {review.feedback}
      </p>


      <div className="review-card__footer">

        <span className="review-card__avatar">
          {firstLetter}
        </span>

        <div>

          <span className="review-card__name">
            {review.name}
          </span>

          <span className="review-card__verified">
            Client Feedback
          </span>

        </div>

      </div>

    </article>
  );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RatingsFeedback() {

  const [summary, setSummary] = useState(
    fallbackSummary
  );

  const [reviews, setReviews] = useState(
    fallbackReviews
  );

  const [loadError, setLoadError] = useState(false);

  const [currentReview, setCurrentReview] = useState(0);


  /* =======================================================
     FORM STATE
  ======================================================= */

  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: 0,
    feedback: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [formError, setFormError] = useState("");

  const [success, setSuccess] = useState(false);


  /* =======================================================
     LOAD DATA
  ======================================================= */

  const load = () => {

    setLoadError(false);


    /* -------------------------------------------------------
       Rating summary
    ------------------------------------------------------- */

    getRatingsSummary()
      .then((data) => {

        if (data) {
          setSummary(data);
        }

      })
      .catch(() => {
        setLoadError(true);
      });


    /* -------------------------------------------------------
       Homepage reviews
       
       IMPORTANT:
       This now calls:
       
       /api/ratings?limit=6
       
       So the browser never downloads all reviews.
    ------------------------------------------------------- */

    getHomepageReviews()
      .then((data) => {

        if (Array.isArray(data)) {

          const limitedReviews = data.slice(
            0,
            HOMEPAGE_REVIEW_LIMIT
          );

          setReviews(limitedReviews);

          setCurrentReview(0);
        }

      })
      .catch(() => {
        setLoadError(true);
      });

  };


  useEffect(() => {
    load();
  }, []);


  /* =======================================================
     PREVIOUS REVIEW
  ======================================================= */

  const handlePrevious = () => {

    if (reviews.length <= 1) return;

    setCurrentReview((current) =>
      current === 0
        ? reviews.length - 1
        : current - 1
    );

  };


  /* =======================================================
     NEXT REVIEW
  ======================================================= */

  const handleNext = () => {

    if (reviews.length <= 1) return;

    setCurrentReview((current) =>
      current === reviews.length - 1
        ? 0
        : current + 1
    );

  };


  /* =======================================================
     SUBMIT FEEDBACK
  ======================================================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    setFormError("");
    setSuccess(false);

    const name = form.name.trim();
    const feedback = form.feedback.trim();


    if (!name) {
      setFormError("Please enter your name.");
      return;
    }


    if (!form.rating) {
      setFormError("Please choose a star rating.");
      return;
    }


    if (!feedback) {
      setFormError("Please write your feedback.");
      return;
    }


    if (name.length > MAX_NAME) {
      setFormError(
        `Name must be under ${MAX_NAME} characters.`
      );
      return;
    }


    if (feedback.length > MAX_FEEDBACK) {
      setFormError(
        `Feedback must be under ${MAX_FEEDBACK} characters.`
      );
      return;
    }


    setSubmitting(true);


    try {

      await submitRating({
        name,
        email: form.email.trim(),
        rating: form.rating,
        feedback,
      });


      setForm({
        name: "",
        email: "",
        rating: 0,
        feedback: "",
      });


      setSuccess(true);

      /*
       * Reload summary + homepage reviews.
       *
       * Backend still returns only the required
       * homepage reviews.
       */
      load();

    } catch (err) {

      setFormError(
        err?.response?.data?.error ||
          "Something went wrong — please try again."
      );

    } finally {

      setSubmitting(false);

    }

  };


  const activeReview =
    reviews[currentReview];


  return (

    <section className="section section-alt ratings-section">

      <div className="container">


        {/* =================================================
            HEADING
        ================================================= */}

        <div className="ratings-heading">

          <div>

            <span className="eyebrow">
              Client Success
            </span>

            <h2 className="section-heading">
              What Our Clients Say
            </h2>

            <p className="section-subheading">
              Real feedback from the teams we work with
              every day — and we&rsquo;d love to hear from
              you too.
            </p>

          </div>


          <Link
            to="/reviews"
            className="ratings-view-all"
          >
            View All Reviews
            <FaArrowRight />
          </Link>

        </div>


        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <div className="ratings-layout">


          {/* =================================================
              LEFT COLUMN
              SUMMARY + REVIEWS
          ================================================= */}

          <div className="ratings-col">


            {/* =================================================
                RATING SUMMARY CARD
            ================================================= */}

            <div className="rating-summary-card">

              <div className="rating-summary-card__top">

                <span className="rating-summary-card__label">
                  Client Reviews
                </span>

                <span className="rating-summary-card__badge">
                  {summary.total}{" "}
                  {summary.total === 1
                    ? "Review"
                    : "Reviews"}
                </span>

              </div>


              <span className="rating-summary-card__value">
                {Number(summary.average || 0).toFixed(1)}
              </span>


              <Stars
                value={summary.average}
              />


              <span className="rating-summary-card__count">
                Based on {summary.total}{" "}
                {summary.total === 1
                  ? "review"
                  : "reviews"}
              </span>


              <div className="rating-summary-card__line" />


              <p>
                Your experience matters to us. Share
                your feedback and help us continue
                improving the way we serve our clients.
              </p>

            </div>


            {/* =================================================
                REVIEWS
            ================================================= */}

            <div className="ratings-col--reviews">

              <div className="reviews-header">

                <div>

                  <span>
                    Client Feedback
                  </span>

                  <strong>
                    What our clients say
                  </strong>

                </div>


                {reviews.length > 1 && (

                  <div className="review-controls">

                    <button
                      type="button"
                      onClick={handlePrevious}
                      aria-label="Previous review"
                    >
                      <FaArrowLeft />
                    </button>


                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Next review"
                    >
                      <FaArrowRight />
                    </button>

                  </div>

                )}

              </div>


              <div className="review-carousel">

                {reviews.length === 0 ? (

                  <div className="review-list__empty">

                    <p>
                      No reviews yet.
                    </p>

                    <p>
                      Be the first to share your experience.
                    </p>

                  </div>

                ) : (

                  <ReviewCard
                    review={activeReview}
                  />

                )}

              </div>


              {reviews.length > 1 && (

                <div className="review-dots">

                  {reviews.map((review, index) => (

                    <button
                      key={review.id ?? index}
                      type="button"
                      className={`review-dot ${
                        index === currentReview
                          ? "review-dot--active"
                          : ""
                      }`}
                      onClick={() =>
                        setCurrentReview(index)
                      }
                      aria-label={`Show review ${
                        index + 1
                      }`}
                      aria-current={
                        index === currentReview
                          ? "true"
                          : undefined
                      }
                    />

                  ))}

                </div>

              )}


              <Link
                to="/reviews"
                className="reviews-bottom-link"
              >
                Browse All Client Reviews
                <FaArrowRight />
              </Link>


              {loadError &&
                reviews.length > 0 && (

                  <p className="review-list__notice">
                    Showing available client feedback.
                  </p>

                )}

            </div>

          </div>


          {/* =================================================
              RIGHT COLUMN
              FEEDBACK FORM
          ================================================= */}

          <div className="ratings-col">


            <form
              className="feedback-form"
              onSubmit={handleSubmit}
            >

              <div className="feedback-form__heading">

                <span className="feedback-form__mini">
                  We&rsquo;d love to hear from you
                </span>

                <h3>
                  Share Your Experience
                </h3>

              </div>


              {/* Name */}

              <label className="feedback-form__field">

                <span>
                  Your Name
                </span>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                  maxLength={MAX_NAME}
                  placeholder="e.g. Priya Shah"
                />

              </label>


              {/* Email */}

              <label className="feedback-form__field">

                <span>
                  Email (optional)
                </span>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      email: e.target.value,
                    }))
                  }
                  maxLength={200}
                  placeholder="you@company.com"
                />

              </label>


              {/* Rating */}

              <div className="feedback-form__field">

                <span>
                  Your Rating
                </span>

                <StarPicker
                  value={form.rating}
                  onChange={(rating) =>
                    setForm((f) => ({
                      ...f,
                      rating,
                    }))
                  }
                />

              </div>


              {/* Feedback */}

              <label className="feedback-form__field">

                <span>
                  Your Feedback
                </span>

                <textarea
                  value={form.feedback}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      feedback: e.target.value,
                    }))
                  }
                  maxLength={MAX_FEEDBACK}
                  rows={6}
                  placeholder="Tell us about your experience working with Alpha Edge…"
                />

              </label>


              {/* Error */}

              {formError && (

                <p className="feedback-form__error">
                  {formError}
                </p>

              )}


              {/* Success */}

              {success && (

                <p className="feedback-form__success">
                  Thanks for your feedback!
                </p>

              )}


              {/* Submit */}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting…"
                  : "Submit Feedback"}
              </button>

            </form>

          </div>

        </div>

      </div>

    </section>

  );
}
