// Fallback content shown if MongoDB is unreachable, and used as the initial
// render before the API responds. Also the source data for `npm run seed`
// (scripts/seed.js), which loads it into MongoDB Atlas — edit freely.

export const placeholderSiteSettings = {
  site_name: "Alpha Edge IT Services Ltd",
  tagline: "Solutions. Technology. Growth.",
  phone_primary: "+44 20 1234 5678",
  email_primary: "info@alphaedgeitservices.co.uk",
  address_line1: "Office 20681",
  address_line2: "182-184 High Street North",
  city: "London",
  postcode: "E6 2JA",
  country: "England",
  linkedin_url: "https://linkedin.com/company/alphaedgeitservices",
  facebook_url: "https://facebook.com/alphaedgeitservices",
  twitter_url: "https://twitter.com/alphaedgeit",
  footer_about_text:
    "Alpha Edge IT Services Ltd delivers cutting-edge technology solutions that help businesses grow, modernise, and stay secure.",
  footer_copyright_text: "© 2026 Alpha Edge IT Services Ltd. All rights reserved.",
};

export const placeholderHome = {
  hero_heading: "Powering Your Business with Smarter IT",
  hero_subheading:
    "Alpha Edge IT Services delivers enterprise-grade technology solutions — cloud, security, infrastructure and software — that drive real growth for your business.",
  hero_cta_text: "Get a Free Consultation",
  hero_cta_link: "/contact",
  stats_projects: 250,
  stats_clients: 120,
  stats_years: 10,
  stats_support: "24/7",
  about_teaser_heading: "Why Choose Alpha Edge?",
  about_teaser_text:
    "We combine deep technical expertise with a client-first approach to deliver IT solutions that give your business a real competitive edge.",
};

export const placeholderAbout = {
  heading: "About Alpha Edge IT Services",
  intro_text:
    "Alpha Edge IT Services Ltd is a technology partner helping businesses modernise, secure, and scale through smart, reliable IT solutions. From cloud migration to managed support, we're the edge your business needs in a digital-first world.",
  mission_text:
    "To empower every client with dependable, future-ready technology that removes friction and unlocks growth.",
  vision_text: "To be the most trusted IT services partner for growing businesses across the UK.",
};

export const placeholderServices = [
  { id: 1, title: "Cloud Solutions", slug: "cloud-solutions", icon: "cloud", short_description: "Migrate, manage and scale on the cloud with confidence." },
  { id: 2, title: "Cybersecurity", slug: "cybersecurity", icon: "shield", short_description: "Protect your business with proactive, layered security." },
  { id: 3, title: "Managed IT Support", slug: "managed-it-support", icon: "support", short_description: "24/7 helpdesk and proactive IT management." },
  { id: 4, title: "Networking & Infrastructure", slug: "networking-infrastructure", icon: "network", short_description: "Robust networks built for performance and uptime." },
  { id: 5, title: "Software Development", slug: "software-development", icon: "code", short_description: "Custom software that fits the way you work." },
  { id: 6, title: "Data & Analytics", slug: "data-analytics", icon: "database", short_description: "Turn your data into actionable insight." },
];

export const placeholderTestimonials = [
  { id: 1, client_name: "Sarah Whitfield", client_role: "Operations Director", company: "Northgate Retail Group", quote: "Alpha Edge transformed our IT infrastructure and cut downtime to almost zero. Outstanding support.", rating: 5 },
  { id: 2, client_name: "Daniel Reyes", client_role: "CTO", company: "Fenwick Logistics", quote: "Their cloud migration was seamless. The team is responsive, sharp, and genuinely cares about outcomes.", rating: 5 },
  { id: 3, client_name: "Meera Patel", client_role: "Founder", company: "Bloom & Co.", quote: "Reliable, proactive, and always a step ahead of problems before they happen.", rating: 5 },
];

export const placeholderTeam = [
  { id: 1, name: "Alex Morgan", role: "Managing Director", bio: "15+ years leading IT transformation programmes for SMEs and enterprise clients." },
  { id: 2, name: "Priya Shah", role: "Head of Cloud & Infrastructure", bio: "Cloud architect specialising in AWS and Azure migrations." },
  { id: 3, name: "James Carter", role: "Head of Cybersecurity", bio: "Leads Alpha Edge's security operations and compliance practice." },
];

// Product marketplace categories. `key` must match each product's `category`.
export const placeholderProductCategories = [
  { key: "switch", label: "Network Switches" },
  { key: "router", label: "Routers & Firewalls" },
  { key: "server", label: "Servers & Compute" },
  { key: "storage", label: "Storage · NAS & SAN" },
  { key: "hub", label: "Hubs & Media Converters" },
  { key: "optic", label: "Optics, Cabling & Power" },
];

// Fallback catalog shown before/if the /products/ API responds. Replace via
// the SalesDigitalCRM admin panel. `stock` is "in" or "order".
export const placeholderProducts = [
  { id: 1, category: "switch", category_label: "Network Switches", brand: "Cisco", name: "Catalyst 9200 24-Port", model: "C9200-24T-E", short_description: "24× GbE data ports, Layer 3, StackWise-160, Network Essentials.", stock: "in", lead_time: "1–2 days" },
  { id: 2, category: "switch", category_label: "Network Switches", brand: "HPE Aruba", name: "6300M 24-Port Switch", model: "JL658A", short_description: "24× 1G, 4× SFP56, VSF stacking, PoE-ready aggregation.", stock: "order", lead_time: "2–3 wks" },
  { id: 3, category: "switch", category_label: "Network Switches", brand: "Ubiquiti", name: "UniFi Switch Pro 48", model: "USW-PRO-48", short_description: "48× GbE + 4× 10G SFP+, Layer 3, silent fan-less design.", stock: "in", lead_time: "In stock" },
  { id: 4, category: "switch", category_label: "Network Switches", brand: "NETGEAR", name: "M4300 Stackable", model: "GSM4352", short_description: "48× 10G + 2× 40G, fully managed, redundant PSU option.", stock: "in", lead_time: "1–2 days" },
  { id: 5, category: "router", category_label: "Routers & Firewalls", brand: "Cisco", name: "ISR 4331 Router", model: "ISR4331/K9", short_description: "Modular services router, up to 100 Mbps aggregate, 3× GE WAN.", stock: "in", lead_time: "2–4 days" },
  { id: 6, category: "router", category_label: "Routers & Firewalls", brand: "Fortinet", name: "FortiGate 60F NGFW", model: "FG-60F", short_description: "10 Gbps firewall, SD-WAN, threat protection for branch sites.", stock: "in", lead_time: "In stock" },
  { id: 7, category: "router", category_label: "Routers & Firewalls", brand: "MikroTik", name: "CCR2004 Cloud Router", model: "CCR2004-1G-12S+2XS", short_description: "12× SFP+, 2× 25G SFP28, RouterOS, high-throughput edge.", stock: "order", lead_time: "1–2 wks" },
  { id: 8, category: "server", category_label: "Servers & Compute", brand: "Dell", name: "PowerEdge R750 2U", model: "R750-XS", short_description: "Dual Xeon Scalable, up to 8TB RAM, 24× NVMe bays.", stock: "in", lead_time: "5–7 days" },
  { id: 9, category: "server", category_label: "Servers & Compute", brand: "HPE", name: "ProLiant DL380 Gen11", model: "P52560-B21", short_description: "2U dual-socket, Gen5 PCIe, iLO 6, flexible drive config.", stock: "in", lead_time: "5–7 days" },
  { id: 10, category: "server", category_label: "Servers & Compute", brand: "Lenovo", name: "ThinkSystem SR650 V3", model: "7D76", short_description: "2U mainstream server, 5th-Gen Xeon, up to 20× EDSFF.", stock: "order", lead_time: "2–3 wks" },
  { id: 11, category: "storage", category_label: "Storage · NAS & SAN", brand: "Synology", name: "RackStation RS3621xs+", model: "RS3621XS+", short_description: "12-bay 2U NAS, expandable to 36 bays, 10GbE, DSM.", stock: "in", lead_time: "3–5 days" },
  { id: 12, category: "storage", category_label: "Storage · NAS & SAN", brand: "Dell", name: "PowerVault ME5024", model: "ME5024", short_description: "24-bay 2U SAN, dual controllers, SAS/iSCSI/FC options.", stock: "order", lead_time: "2–3 wks" },
  { id: 13, category: "hub", category_label: "Hubs & Media Converters", brand: "TP-Link", name: "8-Port Desktop Hub", model: "TL-SF1008D", short_description: "8× 10/100 Mbps unmanaged, plug-and-play small office.", stock: "in", lead_time: "In stock" },
  { id: 14, category: "hub", category_label: "Hubs & Media Converters", brand: "StarTech", name: "Gigabit Fibre Converter", model: "MCM1110SFP", short_description: "Copper-to-fibre media converter, open SFP slot, 1000Base.", stock: "in", lead_time: "1–2 days" },
  { id: 15, category: "optic", category_label: "Optics, Cabling & Power", brand: "Cisco", name: "10G SFP+ SR Optic", model: "SFP-10G-SR", short_description: "10GBASE-SR multimode, 850nm, LC duplex, 300m reach.", stock: "in", lead_time: "In stock" },
  { id: 16, category: "optic", category_label: "Optics, Cabling & Power", brand: "HPE Aruba", name: "10G SFP+ DAC Cable 3m", model: "J9283D", short_description: "Direct-attach copper, SFP+ to SFP+, passive, low-power.", stock: "in", lead_time: "In stock" },
  { id: 17, category: "optic", category_label: "Optics, Cabling & Power", brand: "APC", name: "Smart-UPS 1500VA RM", model: "SMT1500RMI2U", short_description: "2U rack-mount line-interactive UPS, 1000W, network card slot.", stock: "in", lead_time: "2–4 days" },
  { id: 18, category: "optic", category_label: "Optics, Cabling & Power", brand: "Tripp Lite", name: "Metered PDU 20A", model: "PDUMH20HVAT", short_description: "1U horizontal PDU, 12× C13, local current metering.", stock: "in", lead_time: "3–5 days" },
  { id: 19, category: "optic", category_label: "Optics, Cabling & Power", brand: "Panduit", name: "Cat6A 48-Port Patch Panel", model: "CPP48WBLY", short_description: "2U shielded feed-through panel, 48 ports, tool-less.", stock: "order", lead_time: "1–2 wks" },
];
