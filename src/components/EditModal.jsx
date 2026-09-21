import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaTrashAlt } from "react-icons/fa";
import ImageField from "./ImageField";
import "./EditModal.css";

// Generic single-item editor used by every inline "edit" icon on the site.
// `fields` describes exactly the fields that section is allowed to change —
// there's no field for color/layout/animation, so those simply can't be
// touched from here. `onDelete` is optional — pass it to also offer a
// delete action (used by product editing), gated behind a confirm step so
// nothing is removed by an accidental click.
// `folder` picks the storage sub-folder for any image fields (e.g. "hero"
// → /uploads/hero/...); a field can override it with its own `folder`.
export default function EditModal({ title, fields, initialValues, onSave, onClose, onDelete, folder = "images" }) {
  const [form, setForm] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete");
      setDeleting(false);
    }
  };

  // Rendered straight onto <body> via a portal — some sections (e.g. the
  // home hero) set `isolation: isolate` on their own container for their
  // slide animations, which traps a normally-positioned fixed modal inside
  // that section's stacking context and lets the navbar paint over it. A
  // portal sidesteps that entirely, so this is never an issue anywhere.
  return createPortal(
    <div className="edit-modal-backdrop" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="edit-modal__head">
          <h3>{title}</h3>
          <button type="button" className="edit-modal__close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {confirmingDelete ? (
          <>
            <div className="edit-modal__body">
              <p className="edit-modal__confirm-text">
                Are you sure you want to delete this? This can&rsquo;t be undone.
              </p>
              {error && <p className="field-error">{error}</p>}
            </div>
            <div className="edit-modal__actions">
              <button type="button" className="edit-modal__cancel" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                Cancel
              </button>
              <button type="button" className="edit-modal__delete-confirm" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="edit-modal__body">
              {fields.map((f) => (
                <div className="edit-modal__field" key={f.name}>
                  {f.type !== "image" && f.type !== "checkbox" && <label>{f.label}</label>}
                  {f.type === "image" ? (
                    <ImageField label={f.label} value={form[f.name]} onChange={(v) => setField(f.name, v)} folder={f.folder || folder} />
                  ) : f.type === "textarea" ? (
                    <textarea
                      value={form[f.name] || ""}
                      onChange={(e) => setField(f.name, e.target.value)}
                      rows={3}
                      maxLength={f.maxLength}
                    />
                  ) : f.type === "select" ? (
                    <select value={form[f.name] || ""} onChange={(e) => setField(f.name, e.target.value)}>
                      {f.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : f.type === "checkbox" ? (
                    <label className="edit-modal__checkbox">
                      <input
                        type="checkbox"
                        checked={Boolean(form[f.name])}
                        onChange={(e) => setField(f.name, e.target.checked)}
                      />
                      {f.label}
                    </label>
                  ) : (
                    <input
                      value={form[f.name] || ""}
                      onChange={(e) => setField(f.name, e.target.value)}
                      maxLength={f.maxLength}
                    />
                  )}
                </div>
              ))}
              {error && <p className="field-error">{error}</p>}
            </div>
            <div className="edit-modal__actions">
              {onDelete && (
                <button
                  type="button"
                  className="edit-modal__delete"
                  onClick={() => setConfirmingDelete(true)}
                  aria-label="Delete"
                  title="Delete"
                >
                  <FaTrashAlt />
                </button>
              )}
              <div className="edit-modal__actions-right">
                <button type="button" className="edit-modal__cancel" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="edit-modal__save" onClick={submit} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
