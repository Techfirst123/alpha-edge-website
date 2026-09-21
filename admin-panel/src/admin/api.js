// Admin panel API calls. Everything here talks to /api/admin/* (session
// cookie required) and writes straight to MongoDB — the public website only
// ever reads those same documents back.
import axios from "axios";

const data = (r) => r.data;

export {
  adminLogin,
  adminLogout,
  adminCheckSession,
  adminUpdateHeroSlide,
  adminUpdateSupplyCategories,
  adminUpdateWhoWeAreImage,
  adminUpdateExpertiseTile,
  getAnalytics,
  adminImportProducts,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetProductStats,
  adminGetRatings,
  adminListAdmins,
  adminCreateAdmin,
  adminUpdateAdminRole,
  adminDeleteAdmin,
  getHeroSlides,
  getSupplyCategories,
  getWhoWeAreImages,
  getExpertiseTiles,
  getProducts,
} from "../api/client";

// Single-document sections: siteSettings | homepageContent | aboutContent
export const getContent = (section) =>
  axios.get("/api/admin/content", { params: { section } }).then(data);
export const saveContent = (section, values) =>
  axios.put("/api/admin/content", { section, values }).then(data);

// List collections: services | team
export const listItems = (collection) => axios.get(`/api/admin/${collection}`).then(data);
export const createItem = (collection, values) => axios.post(`/api/admin/${collection}`, values).then(data);
export const updateItem = (collection, values) => axios.put(`/api/admin/${collection}`, values).then(data);
export const deleteItem = (collection, id) => axios.delete(`/api/admin/${collection}`, { data: { id } }).then(data);
export const reorderItems = (collection, ids) => axios.patch(`/api/admin/${collection}`, { ids }).then(data);

export const createProduct = (values) => axios.post("/api/admin/products", values).then(data);

export const getLeads = () => axios.get("/api/admin/leads").then(data);
export const setLeadStatus = (id, status) => axios.put("/api/admin/leads", { id, status }).then(data);
export const deleteLead = (id) => axios.delete("/api/admin/leads", { data: { id } }).then(data);

export const deleteReview = (id) => axios.delete("/api/admin/ratings", { data: { id } }).then(data);

export const errorText = (err, fallback = "Something went wrong") =>
  err?.response?.data?.error || fallback;
