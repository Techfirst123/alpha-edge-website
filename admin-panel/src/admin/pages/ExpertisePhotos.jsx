import { useEffect, useState } from "react";
import { DEFAULT_EXPERTISE_IMAGES } from "../../data/contentDefaults";
import { adminUpdateExpertiseTile, errorText, getExpertiseTiles } from "../api";
import { Card, ImageInput, Loading, PageHeader, useToast } from "../ui";

export const EXPERTISE_TITLES = [
  "Expertise in Network System",
  "Expertise in Hardware",
  "All Time Stocks",
  "Efficiency & Value",
  "100% Satisfaction Guaranteed",
  "Dedicated Support",
];

// Each photo saves as soon as it's uploaded.
export default function ExpertisePhotos() {
  const toast = useToast();
  const [images, setImages] = useState(null);

  useEffect(() => {
    getExpertiseTiles()
      .then((d) => setImages(DEFAULT_EXPERTISE_IMAGES.map((def, i) => d.images?.[i] || def)))
      .catch(() => setImages(DEFAULT_EXPERTISE_IMAGES));
  }, []);

  const change = async (i, url) => {
    try {
      await adminUpdateExpertiseTile(i, url);
      setImages((all) => all.map((x, j) => (j === i ? url : x)));
      toast(`"${EXPERTISE_TITLES[i]}" photo updated`);
    } catch (e) {
      toast(errorText(e, "Save failed"), "error");
    }
  };

  return (
    <>
      <PageHeader title="Expertise photos" subtitle="The six photo tiles in the “Our Expertise” section. Uploading a photo saves it straight away." />
      {!images ? (
        <Loading />
      ) : (
        <div className="adm-tiles">
          {EXPERTISE_TITLES.map((t, i) => (
            <Card key={t} title={t}>
              <ImageInput value={images[i]} onChange={(url) => change(i, url)} folder="expertise" aspect="4 / 3" />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
