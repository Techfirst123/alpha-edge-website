// Default content for the sections editable from /admin. Shown until an
// admin replaces them, and used by Admin.jsx to pre-fill forms/previews —
// kept in one place (rather than exported from each component) so editing
// a component file doesn't break that file's Fast Refresh.
import slide1 from "../assets/hero 1.avif";
import slide2 from "../assets/hero2.png";
import slide3 from "../assets/hero3.png";
// Slide 4: the Alpha Edge "global IT supply" banner, cropped to its scene
// (globe, shipping, vendor boxes, server racks) so the hero headline can sit
// on the left — the banner's own logo, text and contact footer are left out.
import slide4 from "../assets/hero-global-supply.webp";
import apartImg from "../assets/whoweare/apart.webp";
import sourcingImg from "../assets/whoweare/sourcing.webp";
import buildImg from "../assets/whoweare/build-configure.webp";
import verifiedImg from "../assets/whoweare/verified.webp";
import supportImg from "../assets/whoweare/support.webp";

export const DEFAULT_SLIDES = [
  {
    image: slide1,
    eyebrow: "Alpha Edge IT Services Ltd",
    heading: "Powering Your Business with Smarter IT",
    subtitle: "Enterprise-grade technology solutions — cloud, security, infrastructure and software — that drive real growth for your business.",
  },
  {
    image: slide2,
    eyebrow: "Cloud & Cybersecurity",
    heading: "Cloud. Security. Growth.",
    subtitle: "Scalable cloud platforms and layered cybersecurity, built around the way your business actually works.",
  },
  {
    image: slide3,
    eyebrow: "Always On, Always Watching",
    heading: "Engineered for Uptime, Built on Trust",
    subtitle: "24/7 monitoring and rapid response from a team that stops issues before they become downtime.",
  },
  {
    image: slide4,
    eyebrow: "Global IT Solutions",
    heading: "The Sharp Edge of IT Supply",
    subtitle: "IT hardware supply, consultancy & support, networking solutions and international trading — genuine products delivered worldwide.",
  },

];

export const DEFAULT_CATEGORIES = [
  { label: "Network Switches", sub: "Access to core, GbE–100G" },
  { label: "Routers & Gateways", sub: "Edge, SD-WAN, branch" },
  { label: "Firewalls & Security", sub: "NGFW, UTM appliances" },
  { label: "Access Points & Wi-Fi", sub: "Indoor, outdoor, controllers" },
  { label: "Servers & Compute", sub: "Rack, tower, blade" },
  { label: "Storage · NAS & SAN", sub: "Arrays, backup, expansion" },
  { label: "Optics · GLC & SFP", sub: "Transceivers, DAC, cabling" },
  { label: "IP Phones & UC", sub: "Handsets, gateways, DECT" },
];

export const DEFAULT_APART_IMAGE = apartImg;
export const DEFAULT_CAPABILITY_IMAGES = [sourcingImg, buildImg, verifiedImg, supportImg];

export const DEFAULT_EXPERTISE_IMAGES = [
  "/expertise/network.jpg",
  "/expertise/hardware.jpg",
  "/expertise/stock.jpg",
  "/expertise/efficiency.jpg",
  "/expertise/satisfaction.jpg",
  "/expertise/support.jpg",
];
