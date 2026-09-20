import axios from "axios";

const asList = (data) => {
  if (!Array.isArray(data)) {
    throw new Error("Expected an array response");
  }

  return data;
};

const asObject = (data) => {
  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data)
  ) {
    throw new Error("Expected an object response");
  }

  return data;
};

/* =========================================================
   PUBLIC WEBSITE APIs
========================================================= */

export const getSiteSettings = () =>
  axios
    .get("/api/site-settings")
    .then((r) => asObject(r.data));

export const getHomepageContent = () =>
  axios
    .get("/api/homepage-content")
    .then((r) => asObject(r.data));

export const getAboutContent = () =>
  axios
    .get("/api/about-content")
    .then((r) => asObject(r.data));

export const getServices = () =>
  axios
    .get("/api/services")
    .then((r) => asList(r.data));

export const getProducts = () =>
  axios
    .get("/api/products")
    .then((r) => asList(r.data));

export const getTeam = () =>
  axios
    .get("/api/team")
    .then((r) => asList(r.data));

export const submitLead = (payload) =>
  axios
    .post("/api/leads", payload)
    .then((r) => r.data);

export const getHeroSlides = () =>
  axios
    .get("/api/hero-slides")
    .then((r) => asObject(r.data));

export const getSupplyCategories = () =>
  axios
    .get("/api/supply-categories")
    .then((r) => asObject(r.data));

export const getWhoWeAreImages = () =>
  axios
    .get("/api/who-we-are-images")
    .then((r) => asObject(r.data));

export const getExpertiseTiles = () =>
  axios
    .get("/api/expertise-tiles")
    .then((r) => asObject(r.data));


/* =========================================================
   ADMIN AUTH
========================================================= */

export const adminLogin = (email, password) =>
  axios
    .post("/api/admin/login", {
      email,
      password,
    })
    .then((r) => r.data);

export const adminLogout = () =>
  axios
    .post("/api/admin/logout")
    .then((r) => r.data);

export const adminCheckSession = () =>
  axios
    .get("/api/admin/me")
    .then((r) => r.data);


/* =========================================================
   ADMIN CONTENT MANAGEMENT
========================================================= */

export const adminUpdateHeroSlide = (slide) =>
  axios
    .put("/api/admin/hero-slides", slide)
    .then((r) => r.data);

export const adminUpdateSupplyCategories = (categories) =>
  axios
    .put("/api/admin/supply-categories", {
      categories,
    })
    .then((r) => r.data);

export const adminUpdateWhoWeAreImage = (payload) =>
  axios
    .put("/api/admin/who-we-are-images", payload)
    .then((r) => r.data);

export const adminUpdateExpertiseTile = (index, image) =>
  axios
    .put("/api/admin/expertise-tiles", {
      index,
      image,
    })
    .then((r) => r.data);


/* =========================================================
   ANALYTICS
========================================================= */

export const trackEvent = (payload) =>
  axios
    .post("/api/track", payload)
    .then((r) => r.data);

export const getAnalytics = () =>
  axios
    .get("/api/admin/analytics")
    .then((r) => r.data);


/* =========================================================
   PRODUCTS
========================================================= */

export const adminImportProducts = (fileDataUrl) =>
  axios
    .post("/api/admin/import-products", {
      file: fileDataUrl,
    })
    .then((r) => r.data);

export const adminUpdateProduct = (product) =>
  axios
    .put("/api/admin/products", product)
    .then((r) => r.data);

export const adminDeleteProduct = (id) =>
  axios
    .delete("/api/admin/products", {
      data: {
        id,
      },
    })
    .then((r) => r.data);

export const adminGetProductStats = () =>
  axios
    .get("/api/admin/product-stats")
    .then((r) => r.data);


/* =========================================================
   RATINGS & REVIEWS
========================================================= */

/*
 * Existing ratings API
 *
 * This is kept for backward compatibility.
 * It returns all reviews when /api/ratings is called
 * without pagination parameters.
 */
export const getRatings = () =>
  axios
    .get("/api/ratings")
    .then((r) => asList(r.data));


/*
 * Homepage reviews
 *
 * Only 6 reviews are requested from the backend.
 *
 * GET /api/ratings?limit=6
 */
export const getHomepageReviews = () =>
  axios
    .get("/api/ratings?limit=6")
    .then((r) => {
      if (Array.isArray(r.data)) {
        return r.data;
      }

      return Array.isArray(r.data?.reviews)
        ? r.data.reviews
        : [];
    });


/*
 * Reviews page pagination
 *
 * Example:
 *
 * getReviewsPage(1, 10)
 * getReviewsPage(2, 10)
 *
 * Backend:
 * /api/ratings?page=1&limit=10
 */
export const getReviewsPage = (page = 1, limit = 10) =>
  axios
    .get(`/api/ratings?page=${page}&limit=${limit}`)
    .then((r) => {
      if (
        !r.data ||
        typeof r.data !== "object" ||
        Array.isArray(r.data)
      ) {
        throw new Error("Invalid reviews response");
      }

      return {
        reviews: Array.isArray(r.data.reviews)
          ? r.data.reviews
          : [],

        page: Number(r.data.page) || page,

        limit: Number(r.data.limit) || limit,

        total: Number(r.data.total) || 0,

        totalPages:
          Number(r.data.totalPages) || 1,
      };
    });


/*
 * Rating summary
 */
export const getRatingsSummary = () =>
  axios
    .get("/api/ratings-summary")
    .then((r) => asObject(r.data));


/*
 * Submit public feedback
 */
export const submitRating = (payload) =>
  axios
    .post("/api/ratings", payload)
    .then((r) => r.data);


/* =========================================================
   ADMIN — RATINGS
========================================================= */

export const adminGetRatings = () =>
  axios
    .get("/api/admin/ratings")
    .then((r) => r.data);


/* =========================================================
   ADMIN — ADMINS
========================================================= */

export const adminListAdmins = () =>
  axios
    .get("/api/admin/admins")
    .then((r) => asList(r.data));

export const adminCreateAdmin = (payload) =>
  axios
    .post("/api/admin/admins", payload)
    .then((r) => r.data);

export const adminUpdateAdminRole = (id, role) =>
  axios
    .put("/api/admin/admins", {
      id,
      role,
    })
    .then((r) => r.data);

export const adminDeleteAdmin = (id) =>
  axios
    .delete("/api/admin/admins", {
      data: {
        id,
      },
    })
    .then((r) => r.data);
