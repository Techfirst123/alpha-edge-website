import { useState } from "react";
import axios from "axios";

const MAX_IMAGE_MB = 8;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Uploads the chosen file into this project's public/uploads/ folder and
// reports back the permanent URL — the field never sends raw image bytes
// through the content-save endpoints, only that URL.
export default function ImageField({ label, value, onChange, folder = "uploads" }) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Image too large — please use one under ${MAX_IMAGE_MB}MB`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const { data } = await axios.post("/api/admin/upload-image", { image: dataUrl, folder });
      onChange(data.url);
    } catch (err) {
      setError(err?.response?.data?.error || "Upload failed — try again");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="image-field">
      {label && <label>{label}</label>}
      {value && <img src={value} alt="" className="image-field__preview" />}
      <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
      {uploading && <p className="image-field__status">Uploading…</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
