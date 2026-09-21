import { placeholderSiteSettings } from "../../data/placeholder";
import { PageHeader } from "../ui";
import SectionEditor from "./SectionEditor";

const GROUPS = [
  {
    title: "Company",
    fields: [
      { name: "site_name", label: "Company name", maxLength: 120 },
      { name: "tagline", label: "Tagline", maxLength: 160 },
    ],
  },
  {
    title: "Contact details",
    subtitle: "Used in the footer, the Contact page and the page hero cards.",
    fields: [
      { name: "phone_primary", label: "Phone", maxLength: 40 },
      { name: "email_primary", label: "Email", type: "email", maxLength: 160 },
      { name: "address_line1", label: "Address line 1", maxLength: 160 },
      { name: "address_line2", label: "Address line 2", maxLength: 160 },
      { name: "city", label: "City", maxLength: 80 },
      { name: "postcode", label: "Postcode", maxLength: 20 },
      { name: "country", label: "Country", maxLength: 80 },
    ],
  },
  {
    title: "Social links",
    subtitle: "Leave a link empty to hide that icon.",
    fields: [
      { name: "linkedin_url", label: "LinkedIn", type: "url", maxLength: 300, placeholder: "https://" },
      { name: "facebook_url", label: "Facebook", type: "url", maxLength: 300, placeholder: "https://" },
      { name: "twitter_url", label: "X / Twitter", type: "url", maxLength: 300, placeholder: "https://" },
      { name: "instagram_url", label: "Instagram", type: "url", maxLength: 300, placeholder: "https://" },
    ],
  },
  {
    title: "Footer",
    fields: [
      { name: "footer_about_text", label: "Footer description", type: "textarea", maxLength: 400, rows: 3 },
      { name: "footer_copyright_text", label: "Copyright line", maxLength: 200, wide: true },
    ],
  },
];

export default function SiteSettings() {
  return (
    <>
      <PageHeader title="Site settings" subtitle="Company details used across the whole website." />
      <SectionEditor section="siteSettings" groups={GROUPS} defaults={placeholderSiteSettings} />
    </>
  );
}
