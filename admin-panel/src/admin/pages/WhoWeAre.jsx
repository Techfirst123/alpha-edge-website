import { useEffect, useState } from "react";
import { DEFAULT_APART_IMAGE, DEFAULT_CAPABILITY_IMAGES } from "../../data/contentDefaults";
import { adminUpdateWhoWeAreImage, errorText, getWhoWeAreImages } from "../api";
import { Card, ImageInput, Loading, PageHeader, useToast } from "../ui";

const CAPABILITY_TITLES = [
  "Multi-brand hardware, sourced right",
  "Racked, wired and configured in-house",
  "Serial-checked and stress-tested",
  "Backed long after the invoice is paid",
];

export default function WhoWeAre() {
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fallback = { apart: DEFAULT_APART_IMAGE, caps: DEFAULT_CAPABILITY_IMAGES };
    getWhoWeAreImages()
      .then((d) =>
        setData({
          apart: d.apartImage || DEFAULT_APART_IMAGE,
          caps: DEFAULT_CAPABILITY_IMAGES.map((def, i) => d.capabilityImages?.[i] || def),
        })
      )
      .catch(() => setData(fallback));
  }, []);

  const save = async (payload, apply, label) => {
    try {
      await adminUpdateWhoWeAreImage(payload);
      setData(apply);
      toast(`${label} updated`);
    } catch (e) {
      toast(errorText(e, "Save failed"), "error");
    }
  };

  if (!data) return <Loading />;

  return (
    <>
      <PageHeader title="Who We Are" subtitle="Photos on the Who We Are page. Uploading a photo saves it straight away." />
      <Card title="“What sets us apart” photo">
        <div className="adm-narrow">
          <ImageInput
            value={data.apart}
            folder="whoweare"
            aspect="16 / 10"
            onChange={(url) => save({ type: "apart", image: url }, (d) => ({ ...d, apart: url }), "Photo")}
          />
        </div>
      </Card>
      <div className="adm-tiles adm-tiles--2">
        {CAPABILITY_TITLES.map((t, i) => (
          <Card key={t} title={t} subtitle={`Capability ${i + 1}`}>
            <ImageInput
              value={data.caps[i]}
              folder="whoweare"
              aspect="4 / 3"
              onChange={(url) =>
                save({ type: "capability", index: i, image: url }, (d) => ({ ...d, caps: d.caps.map((x, j) => (j === i ? url : x)) }), t)
              }
            />
          </Card>
        ))}
      </div>
    </>
  );
}
