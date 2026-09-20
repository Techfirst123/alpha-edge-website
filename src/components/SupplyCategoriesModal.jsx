import { useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import "./EditModal.css";

export default function SupplyCategoriesModal({ initialCategories, onSave, onClose }) {
  const [categories, setCategories] = useState(initialCategories);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = (i, field, value) =>
    setCategories((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  const addRow = () => setCategories((prev) => [...prev, { label: "", sub: "" }]);
  const removeRow = (i) => setCategories((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave(categories.filter((c) => c.label.trim()));
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="edit-modal-backdrop" onClick={onClose}>
      <div
        className="edit-modal edit-modal--wide"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Edit What We Supply"
      >
        <div className="edit-modal__head">
          <h3>What We Supply</h3>
          <button type="button" className="edit-modal__close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="edit-modal__body">
          {categories.map((c, i) => (
            <div className="edit-modal__row" key={i}>
              <input
                value={c.label}
                onChange={(e) => updateField(i, "label", e.target.value)}
                placeholder="Label — e.g. Network Switches"
                maxLength={60}
              />
              <input
                value={c.sub}
                onChange={(e) => updateField(i, "sub", e.target.value)}
                placeholder="Short sub text"
                maxLength={120}
              />
              <button type="button" className="edit-modal__remove" onClick={() => removeRow(i)} aria-label="Remove item">
                &times;
              </button>
            </div>
          ))}
          <button type="button" className="edit-modal__add" onClick={addRow}>
            + Add Item
          </button>
          {error && <p className="field-error">{error}</p>}
        </div>
        <div className="edit-modal__actions">
          <button type="button" className="edit-modal__cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="edit-modal__save" onClick={submit} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
