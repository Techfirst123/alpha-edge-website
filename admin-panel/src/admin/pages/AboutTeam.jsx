import { placeholderAbout, placeholderTeam } from "../../data/placeholder";
import { PageHeader } from "../ui";
import ListManager from "./ListManager";
import SectionEditor from "./SectionEditor";

const GROUPS = [
  {
    title: "About page text",
    fields: [
      { name: "heading", label: "Page heading", maxLength: 160, wide: true },
      { name: "intro_text", label: "Introduction", type: "textarea", maxLength: 1200, rows: 5 },
      { name: "mission_text", label: "Our mission", type: "textarea", maxLength: 600 },
      { name: "vision_text", label: "Our vision", type: "textarea", maxLength: 600 },
    ],
  },
];

const TEAM_FIELDS = [
  { name: "name", label: "Full name", maxLength: 80 },
  { name: "role", label: "Job title", maxLength: 120 },
  { name: "bio", label: "Short bio", type: "textarea", maxLength: 400 },
];

export default function AboutTeam() {
  return (
    <>
      <PageHeader title="About & team" subtitle="Text on the About page and the “Meet the Team” cards." />
      <SectionEditor section="aboutContent" groups={GROUPS} defaults={placeholderAbout}>
        <h2 className="adm-subhead">Team members</h2>
        <ListManager
          collection="team"
          noun="Team member"
          fields={TEAM_FIELDS}
          seed={placeholderTeam.map(({ name, role, bio }) => ({ name, role, bio }))}
          emptyText="The About page is showing its built-in team until you add members."
          renderItem={(m) => (
            <div className="adm-item">
              <span className="adm-avatar adm-avatar--lg">{m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
              <div>
                <strong>{m.name}</strong>
                <span className="adm-item__sub">{m.role}</span>
                <p>{m.bio}</p>
              </div>
            </div>
          )}
        />
      </SectionEditor>
    </>
  );
}
