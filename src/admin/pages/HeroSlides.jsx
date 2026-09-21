import { useEffect, useState } from "react";
import { FaUndo } from "react-icons/fa";
import { DEFAULT_SLIDES } from "../../data/contentDefaults";
import { adminUpdateHeroSlide, errorText, getHeroSlides } from "../api";
import { Button, Card, ErrorNote, Field, ImageInput, Loading, PageHeader, useForm, useToast } from "../ui";

// One card per home-page hero slide. An empty image means "use the built-in
// default" — we never store the bundled image's hashed path in MongoDB.
function SlideCard({ index, saved }) {
  const toast = useToast();
  const def = DEFAULT_SLIDES[index];
  const form = useForm({
    eyebrow: saved?.eyebrow || def.eyebrow,
    heading: saved?.heading || def.heading,
    subtitle: saved?.subtitle || def.subtitle,
    image: saved?.image || "",
  });
  const [saving, setSaving] = useState(false);
  const v = form.values;

  const save = async () => {
    setSaving(true);
    try {
      await adminUpdateHeroSlide({ index, ...v });
      form.commit();
      toast(`Slide ${index + 1} saved`);
    } catch (e) {
      toast(errorText(e, "Save failed"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title={`Slide ${index + 1}`}
      subtitle={v.image ? "Custom image" : "Using the built-in image"}
      actions={
        <>
          {form.dirty && <Button variant="ghost" onClick={form.reset}>Discard</Button>}
          <Button variant="accent" loading={saving} disabled={!form.dirty} onClick={save}>Save slide</Button>
        </>
      }
    >
      <div className="adm-slide">
        <div>
          <ImageInput
            value={v.image || def.image}
            onChange={form.set("image")}
            folder="hero"
            aspect="16 / 9"
          />
          {v.image && (
            <button type="button" className="adm-link adm-mt-sm" onClick={() => form.set("image")("")}>
              <FaUndo /> Use the built-in image
            </button>
          )}
        </div>
        <div className="adm-stack">
          <Field label="Small label (eyebrow)" value={v.eyebrow} onChange={form.set("eyebrow")} maxLength={120} />
          <Field label="Headline" value={v.heading} onChange={form.set("heading")} maxLength={160} hint="The last word is highlighted in orange on the site." />
          <Field label="Sub text" type="textarea" rows={3} value={v.subtitle} onChange={form.set("subtitle")} maxLength={300} />
        </div>
      </div>
    </Card>
  );
}

export default function HeroSlides() {
  const [slides, setSlides] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getHeroSlides()
      .then((d) => setSlides(d.slides || []))
      .catch((e) => {
        setError(errorText(e, "Could not load saved slides — showing defaults"));
        setSlides([]);
      });
  }, []);

  return (
    <>
      <PageHeader title="Hero slides" subtitle="The four rotating slides at the top of the home page. Each slide saves on its own." />
      <ErrorNote>{error}</ErrorNote>
      {!slides ? <Loading /> : DEFAULT_SLIDES.map((_, i) => <SlideCard key={i} index={i} saved={slides[i]} />)}
    </>
  );
}
