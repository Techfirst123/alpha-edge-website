import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaFileExcel, FaUpload } from "react-icons/fa";
import { adminImportProducts } from "../api/client";
import "./EditModal.css";
import "./ImportProductsModal.css";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Admin-only bulk product import, triggered from the Products page toolbar.
// Lives here (not the dashboard) since it acts directly on what's showing —
// `onImported` lets the caller refresh its product list afterwards.
export default function ImportProductsModal({ onClose, onImported }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setError("");
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await adminImportProducts(dataUrl);
      setResult(res);
      if (res.imported > 0 || res.updated > 0) onImported?.();
    } catch (err) {
      setError(err?.response?.data?.error || "Import failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return createPortal(
    <div className="edit-modal-backdrop" onClick={onClose}>
      <div
        className="edit-modal edit-modal--wide"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Import Products from Excel"
      >
        <div className="edit-modal__head">
          <h3>Import Products from Excel</h3>
          <button type="button" className="edit-modal__close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="edit-modal__body">
          <p className="import-hint">
            Upload an <strong>.xlsx</strong> file. First row must be column headers. Recognised columns:{" "}
            <code>category</code>, <code>category_label</code>, <code>brand</code>, <code>name</code>,{" "}
            <code>model</code>, <code>short_description</code>, <code>stock</code> (in/order),{" "}
            <code>lead_time</code>, <code>image</code>, <code>featured</code> (yes/no — shows the product in the
            homepage Top 10). If <code>image</code> is a full web link, we download the photo and host it
            ourselves automatically — a plain path works too.
          </p>

          <label className="import-upload">
            <FaFileExcel />
            <span>{fileName || "Choose an .xlsx file"}</span>
            <input ref={fileInputRef} type="file" accept=".xlsx" onChange={handleFile} disabled={uploading} />
          </label>

          {uploading && (
            <p className="import-loading">
              <FaUpload /> Importing — this can take a moment if photos need downloading…
            </p>
          )}
          {error && <p className="field-error">{error}</p>}

          {result && (
            <div className="import-result">
              <p className="import-result__summary">
                <strong>{result.imported}</strong> added, <strong>{result.updated}</strong> updated
                {result.errors.length > 0 && (
                  <>
                    , <strong>{result.errors.length}</strong> skipped
                  </>
                )}
                .
              </p>
              {result.errors.length > 0 && (
                <ul className="import-result__errors">
                  {result.errors.map((e, i) => (
                    <li key={i}>
                      Row {e.row}: {e.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="edit-modal__actions">
          <button type="button" className="edit-modal__cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
