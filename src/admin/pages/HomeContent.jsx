import { placeholderHome } from "../../data/placeholder";
import { PageHeader } from "../ui";
import SectionEditor from "./SectionEditor";

const GROUPS = [
  {
    title: "Hero buttons",
    subtitle: "The main call-to-action button on the home page hero.",
    fields: [
      { name: "hero_cta_text", label: "Button text", maxLength: 60 },
      { name: "hero_cta_link", label: "Button link", maxLength: 200, hint: "A page path like /contact or a full URL" },
    ],
  },
  {
    title: "Stats bar",
    subtitle: "The numbers shown under the hero (and on the About page).",
    fields: [
      { name: "stats_projects", label: "Projects delivered", type: "number", hint: "Shown as 50+" },
      { name: "stats_clients", label: "Happy clients", type: "number", hint: "Shown as 20+" },
      { name: "stats_support", label: "Support availability", maxLength: 20, hint: "e.g. 24/7" },
    ],
  },
  {
    title: "About teaser",
    subtitle: "The \"Why Choose Alpha Edge?\" block on the home page.",
    fields: [
      { name: "about_teaser_heading", label: "Heading", maxLength: 160, wide: true },
      { name: "about_teaser_text", label: "Text", type: "textarea", maxLength: 600 },
    ],
  },
];

export default function HomeContent() {
  return (
    <>
      <PageHeader title="Home text & stats" subtitle="Text and numbers on the home page. Hero slide images and headlines are under Hero slides." />
      <SectionEditor section="homepageContent" groups={GROUPS} defaults={placeholderHome} />
    </>
  );
}
