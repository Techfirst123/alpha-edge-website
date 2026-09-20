import { getDb } from "../_lib/mongodb.js";
import { toPages } from "../_lib/adapter.js";

const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 200;
const MAX_FEEDBACK_LENGTH = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// Strips markup so a review can never inject HTML into the page that
// renders it back out — reviews are plain text everywhere in the UI.
function stripTags(str) {
  return String(str || "").replace(/<[^>]*>/g, "");
}

// Normalizes a stored document (old seeded "testimonials" shape or a new
// public submission) into one consistent public shape.
function toPublicReview(doc) {
  return {
    id: doc.id,
    name: doc.name || doc.client_name || "Anonymous",
    rating: doc.rating || 0,
    feedback: doc.feedback || doc.quote || "",
    createdAt: doc.createdAt || null,
  };
}

function getPositiveInt(value, fallback) {
  const num = Number(value);

  if (!Number.isInteger(num) || num < 1) {
    return fallback;
  }

  return num;
}


async function handler(req, res) {
  const db = await getDb();
  const collection = db.collection("testimonials");

  if (req.method === "GET") {
    try {
      const hasPagination =
        req.query?.page !== undefined ||
        req.query?.limit !== undefined;

      const page = getPositiveInt(req.query?.page, 1);

      const requestedLimit = getPositiveInt(
        req.query?.limit,
        DEFAULT_LIMIT
      );

      const limit = Math.min(requestedLimit, MAX_LIMIT);

      const skip = (page - 1) * limit;

      /*
       * Keep the existing behaviour when no pagination parameters
       * are supplied.
       *
       * This prevents other existing parts of the website from
       * unexpectedly breaking.
       */
      if (!hasPagination) {
        const docs = await collection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();

        return res.status(200).json(docs.map(toPublicReview));
      }

      /*
       * Pagination:
       *
       * Example:
       * /api/ratings?page=1&limit=10
       * /api/ratings?page=2&limit=10
       */
      const [docs, total] = await Promise.all([
        collection
          .find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),

        collection.countDocuments({}),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / limit));

      return res.status(200).json({
        reviews: docs.map(toPublicReview),
        page,
        limit,
        total,
        totalPages,
      });
    } catch (err) {
      console.error("Failed to load ratings:", err);
      return res.status(500).json({
        error: "Failed to load ratings",
      });
    }
  }

  if (req.method === "POST") {
    const { name, email, rating, feedback } = req.body || {};

    const cleanName = stripTags(name)
      .trim()
      .slice(0, MAX_NAME_LENGTH);

    const cleanFeedback = stripTags(feedback)
      .trim()
      .slice(0, MAX_FEEDBACK_LENGTH);

    const cleanEmail = stripTags(email)
      .trim()
      .slice(0, MAX_EMAIL_LENGTH);

    const ratingNum = Number(rating);

    if (!cleanName) {
      return res.status(400).json({
        error: "Name is required",
      });
    }

    if (
      !Number.isInteger(ratingNum) ||
      ratingNum < 1 ||
      ratingNum > 5
    ) {
      return res.status(400).json({
        error: "Rating must be a whole number from 1 to 5",
      });
    }

    if (!cleanFeedback) {
      return res.status(400).json({
        error: "Feedback is required",
      });
    }

    if (cleanEmail && !EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({
        error: "Email address looks invalid",
      });
    }

    try {
      const existingMax = await collection
        .find({}, { projection: { id: 1 } })
        .sort({ id: -1 })
        .limit(1)
        .toArray();

      const id = (existingMax[0]?.id || 0) + 1;

      const doc = {
        id,
        name: cleanName,
        email: cleanEmail,
        rating: ratingNum,
        feedback: cleanFeedback,
        createdAt: new Date(),
      };

      await collection.insertOne(doc);

      return res.status(201).json(toPublicReview(doc));
    } catch (err) {
      console.error("Failed to save rating:", err);

      return res.status(500).json({
        error: "Failed to save your feedback",
      });
    }
  }

  res.setHeader("Allow", "GET, POST");

  return res.status(405).json({
    error: "Method not allowed",
  });
}

export const onRequest = toPages(handler);
