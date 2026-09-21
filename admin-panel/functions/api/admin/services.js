import { requireAdmin } from "../../_lib/auth.js";
import { toPages } from "../../_lib/adapter.js";
import { listCrudHandler } from "../../_lib/listCrud.js";

// Admin panel CRUD for the "services" collection — see _lib/listCrud.js.
const handler = requireAdmin(listCrudHandler("services"));

export const onRequest = toPages(handler);
