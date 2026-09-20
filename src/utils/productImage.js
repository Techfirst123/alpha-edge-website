import switchImg from "../assets/products/switch.webp";
import switchImg2 from "../assets/products/switch-2.webp";
import routerImg from "../assets/products/router.webp";
import routerImg2 from "../assets/products/router-2.webp";
import serverImg from "../assets/products/server.webp";
import serverImg2 from "../assets/products/server-2.webp";
import storageImg from "../assets/products/storage.webp";
import storageImg2 from "../assets/products/storage-2.webp";
import hubImg from "../assets/products/hub.webp";
import cableDacImg from "../assets/products/cable-dac.webp";
import opticImg from "../assets/products/optic.webp";
import patchPanelImg from "../assets/products/patch-panel.webp";

// Several variants per category so products sharing a category don't all
// show the exact same photo — cycled deterministically by product id below.
const CATEGORY_IMAGES = {
  switch: [switchImg, switchImg2],
  router: [routerImg, routerImg2],
  server: [serverImg, serverImg2],
  storage: [storageImg, storageImg2],
  hub: [hubImg, cableDacImg],
  optic: [opticImg, cableDacImg, patchPanelImg, switchImg2, routerImg2],
};

export function imageFor(product) {
  if (product.image) return product.image; // a real photo (e.g. from Excel import) wins over the generic rotation
  const variants = CATEGORY_IMAGES[product.category];
  if (!variants || !variants.length) return null;
  const key = product.id ?? product.model ?? product.name ?? "0";
  const index = typeof key === "number"
    ? key
    : String(key).split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return variants[index % variants.length];
}
