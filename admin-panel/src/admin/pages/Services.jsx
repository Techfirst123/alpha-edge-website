import { FaCloud, FaCode, FaDatabase, FaHeadset, FaMicrochip, FaNetworkWired, FaShieldAlt, FaUsersCog } from "react-icons/fa";
import { placeholderServices } from "../../data/placeholder";
import { PageHeader } from "../ui";
import ListManager from "./ListManager";

const ICONS = {
  cloud: FaCloud,
  shield: FaShieldAlt,
  support: FaHeadset,
  network: FaNetworkWired,
  code: FaCode,
  database: FaDatabase,
  chip: FaMicrochip,
  headset: FaUsersCog,
};

const ICON_OPTIONS = [
  { value: "cloud", label: "Cloud" },
  { value: "shield", label: "Shield / security" },
  { value: "support", label: "Support headset" },
  { value: "network", label: "Network" },
  { value: "code", label: "Code" },
  { value: "database", label: "Database" },
  { value: "chip", label: "Chip / hardware" },
  { value: "headset", label: "Team / managed" },
];

const FIELDS = [
  { name: "title", label: "Service name", maxLength: 80 },
  { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
  { name: "short_description", label: "Short description", type: "textarea", maxLength: 300 },
];

export default function Services() {
  return (
    <>
      <PageHeader title="Services" subtitle="The “What We Do” cards on the home page and the service list on the Get a Quote form. Use the arrows to change the order." />
      <ListManager
        collection="services"
        noun="Service"
        fields={FIELDS}
        seed={placeholderServices.map(({ title, icon, short_description }) => ({ title, icon, short_description }))}
        emptyText="The website is showing its built-in services until you add some."
        renderItem={(s) => {
          const Icon = ICONS[s.icon] || FaCloud;
          return (
            <div className="adm-item">
              <span className="adm-item__icon"><Icon /></span>
              <div>
                <strong>{s.title}</strong>
                <p>{s.short_description}</p>
              </div>
            </div>
          );
        }}
      />
    </>
  );
}
