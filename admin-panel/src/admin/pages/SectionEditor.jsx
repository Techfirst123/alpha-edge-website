import { useEffect, useState } from "react";
import { errorText, getContent, saveContent } from "../api";
import { Card, ErrorNote, Field, Loading, SaveBar, useForm, useToast } from "../ui";

// Generic editor for one single-document section (siteSettings,
// homepageContent, aboutContent). `groups` lays the fields out in cards:
//   [{ title, subtitle, fields: [{ name, label, type, maxLength, hint, wide }] }]
// Values missing from the database start from `defaults`, which are what
// the public site currently shows as its fallback.
export default function SectionEditor({ section, groups, defaults = {}, children }) {
  const toast = useToast();
  const form = useForm(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const names = groups.flatMap((g) => g.fields.map((f) => f.name));

  useEffect(() => {
    getContent(section)
      .then((doc) => {
        const v = {};
        names.forEach((n) => {
          const val = doc?.[n] ?? defaults[n] ?? "";
          v[n] = typeof val === "number" ? String(val) : val;
        });
        form.load(v);
      })
      .catch((e) => setError(errorText(e, "Failed to load")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const save = async () => {
    setSaving(true);
    try {
      await saveContent(section, form.values);
      form.commit();
      toast("Saved — the website is updated");
    } catch (e) {
      toast(errorText(e, "Save failed"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!form.values) return <Loading />;

  return (
    <>
      {groups.map((g) => (
        <Card key={g.title} title={g.title} subtitle={g.subtitle}>
          <div className="adm-form-grid">
            {g.fields.map((f) => (
              <div key={f.name} className={f.wide || f.type === "textarea" ? "adm-span-2" : ""}>
                <Field
                  label={f.label}
                  type={f.type}
                  hint={f.hint}
                  maxLength={f.maxLength}
                  rows={f.rows}
                  placeholder={f.placeholder}
                  value={form.values[f.name]}
                  onChange={form.set(f.name)}
                />
              </div>
            ))}
          </div>
        </Card>
      ))}
      {children}
      <SaveBar dirty={form.dirty} saving={saving} onSave={save} onReset={form.reset} />
    </>
  );
}
