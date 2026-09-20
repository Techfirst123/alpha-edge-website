import { singletonHandler } from "../_lib/handlers.js";
import { toPages } from "../_lib/adapter.js";


const handler = singletonHandler("whoWeAreImages");

export const onRequest = toPages(handler);
