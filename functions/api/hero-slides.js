import { singletonHandler } from "../_lib/handlers.js";
import { toPages } from "../_lib/adapter.js";


const handler = singletonHandler("heroSlides");

export const onRequest = toPages(handler);
