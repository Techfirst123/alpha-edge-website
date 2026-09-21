import { useEffect, useState } from "react";
import {
  FaNetworkWired, FaMicrochip, FaShippingFast,
  FaTachometerAlt, FaAward, FaHeadset,
} from "react-icons/fa";
import { getExpertiseTiles, adminUpdateExpertiseTile } from "../api/client";
import { DEFAULT_EXPERTISE_IMAGES } from "../data/contentDefaults";
import { useAdminAuth } from "../hooks/useAdminAuth";
import EditIconButton from "./EditIconButton";
import EditModal from "./EditModal";
import "./Expertise.css";

/* Drop real photos into public/expertise/ using these file names to replace the
   themed placeholders (e.g. public/expertise/network.jpg). Until then each tile
   shows a charcoal gradient with its icon — no teal, no broken images. */
const TILES = [
  {
    img: "/expertise/network.jpg",
    icon: FaNetworkWired,
    title: "Expertise in Network System",
    text: "Tier1 has built a top-tier network of suppliers and customers who know us well and trust us with their business.",
  },
  {
    img: "/expertise/hardware.jpg",
    icon: FaMicrochip,
    title: "Expertise in Hardware",
    text: "Tier1 has a track record and an extensive knowledge of new and refurbished hardware equipment.",
  },
  {
    img: "/expertise/stock.jpg",
    icon: FaShippingFast,
    title: "All Time Stocks",
    text: "Tier1 have over 10K+ items in stock. Each product has been tested and guaranteed to meet your requirement.",
  },
  {
    img: "/expertise/efficiency.jpg",
    icon: FaTachometerAlt,
    title: "Efficiency & Value",
    text: "Speed, cost and quality balanced on every order.",
  },
  {
    img: "/expertise/satisfaction.jpg",
    icon: FaAward,
    title: "100% Satisfaction Guaranteed",
    text: "We stand behind every unit we ship.",
  },
  {
    img: "/expertise/support.jpg",
    icon: FaHeadset,
    title: "Dedicated Support",
    text: "Real people on hand before and after the sale.",
  },
];

function ExpertiseTile({ tile, isAdmin, onEdit }) {
  const [hasImg, setHasImg] = useState(true);
  const Icon = tile.icon;
  return (
    <article className={`exp-tile ${hasImg ? "" : "exp-tile--placeholder"} ${isAdmin ? "editable-hover-target" : ""}`}>
      {hasImg && (
        <img
          className="exp-tile__img"
          src={tile.img}
          alt={tile.title}
          loading="lazy"
          onError={() => setHasImg(false)}
        />
      )}
      <span className="exp-tile__icon" aria-hidden="true">
        <Icon />
      </span>
      <div className="exp-tile__scrim" />
      <div className="exp-tile__body">
        <h3 className="exp-tile__title">{tile.title}</h3>
        <p className="exp-tile__text">{tile.text}</p>
      </div>
      {isAdmin && <EditIconButton onClick={onEdit} label={`Edit ${tile.title} photo`} />}
    </article>
  );
}

export default function Expertise() {
  const { isAdmin } = useAdminAuth();
  const [images, setImages] = useState(DEFAULT_EXPERTISE_IMAGES);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    getExpertiseTiles()
      .then((d) => setImages(DEFAULT_EXPERTISE_IMAGES.map((def, i) => d.images?.[i] || def)))
      .catch(() => setImages(DEFAULT_EXPERTISE_IMAGES));
  }, []);

  return (
    <section className="section expertise">
      <div className="container">
        <div className="expertise__head">
          <span className="eyebrow">Our Expertise</span>
          <h2 className="section-heading">Take a look at our expertise</h2>
        </div>
        <div className="expertise__grid">
          {TILES.map((tile, i) => (
            <ExpertiseTile
              tile={{ ...tile, img: images[i] || tile.img }}
              isAdmin={isAdmin}
              onEdit={() => setEditingIndex(i)}
              key={tile.title}
            />
          ))}
        </div>
      </div>

      {editingIndex !== null && (
        <EditModal
          folder="expertise"
          title={`Edit ${TILES[editingIndex].title} Photo`}
          fields={[{ name: "image", label: "Photo", type: "image" }]}
          initialValues={{ image: images[editingIndex] }}
          onClose={() => setEditingIndex(null)}
          onSave={async (values) => {
            await adminUpdateExpertiseTile(editingIndex, values.image);
            setImages((prev) => prev.map((p, idx) => (idx === editingIndex ? values.image : p)));
          }}
        />
      )}
    </section>
  );
}
