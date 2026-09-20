import { listHandler } from "../_lib/handlers.js";
import { toPages } from "../_lib/adapter.js";


const handler = listHandler("team");

export const onRequest = toPages(handler);
