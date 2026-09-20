import { listHandler } from "../_lib/handlers.js";
import { toPages } from "../_lib/adapter.js";


const handler = listHandler("services");

export const onRequest = toPages(handler);
