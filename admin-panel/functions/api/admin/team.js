import { requireAdmin } from "../../_lib/auth.js";
import { toPages } from "../../_lib/adapter.js";
import { listCrudHandler } from "../../_lib/listCrud.js";

// Admin panel CRUD for the "team" collection — see _lib/listCrud.js.
const handler = requireAdmin(listCrudHandler("team"));

export const onRequest = toPages(handler);
