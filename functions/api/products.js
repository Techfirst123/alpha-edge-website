import { listHandler } from "../_lib/handlers.js";
import { toPages } from "../_lib/adapter.js";


const handler = listHandler("products");

export const onRequest = toPages(handler);
