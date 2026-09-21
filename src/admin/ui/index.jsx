// Small UI kit for the admin panel. Deliberately separate from the public
// site's components so the two can evolve independently.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaImage,
  FaSpinner,
  FaTimes,
  FaTrashAlt,
  FaUpload,
} from "react-icons/fa";

/* ---------------------------------------------------------------- toasts */

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="adm-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast adm-toast--${t.type}`}>
            {t.type === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ---------------------------------------------------------------- layout */

export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="adm-page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="adm-page-head__actions">{actions}</div>}
    </header>
  );
}

export function Card({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`adm-card ${className}`}>
      {(title || actions) && (
        <div className="adm-card__head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="adm-card__actions">{actions}</div>}
        </div>
      )}
      <div className="adm-card__body">{children}</div>
    </section>
  );
}

export function Button({ variant = "primary", loading, children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`adm-btn adm-btn--${variant} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <FaSpinner className="adm-spin" />}
      {children}
    </button>
  );
}

export function Loading({ label = "Loading…" }) {
  return (
    <div className="adm-loading">
      <FaSpinner className="adm-spin" /> {label}
    </div>
  );
}

export function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <p className="adm-error">
      <FaExclamationTriangle /> {children}
    </p>
  );
}

export function Empty({ icon, title, children }) {
  return (
    <div className="adm-empty">
      {icon && <span className="adm-empty__icon">{icon}</span>}
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Badge({ tone = "neutral", children }) {
  return <span className={`adm-badge adm-badge--${tone}`}>{children}</span>;
}

/* ---------------------------------------------------------------- fields */

export function Field({ label, hint, type = "text", value, onChange, options, maxLength, rows = 4, ...rest }) {
  const id = useMemo(() => `f-${Math.random().toString(36).slice(2, 9)}`, []);

  if (type === "checkbox") {
    return (
      <label className="adm-check" htmlFor={id}>
        <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} {...rest} />
        <span className="adm-check__box" aria-hidden="true" />
        <span>
          {label}
          {hint && <small>{hint}</small>}
        </span>
      </label>
    );
  }

  let control;
  if (type === "textarea") {
    control = (
      <textarea id={id} rows={rows} value={value ?? ""} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} {...rest} />
    );
  } else if (type === "select") {
    control = (
      <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else {
    control = (
      <input
        id={id}
        type={type}
        value={value ?? ""}
        maxLength={maxLength}
        onChange={(e) => onChange(type === "number" ? e.target.value.replace(/[^\d]/g, "") : e.target.value)}
        inputMode={type === "number" ? "numeric" : undefined}
        {...rest}
      />
    );
  }

  const count = typeof value === "string" && maxLength ? `${value.length}/${maxLength}` : null;

  return (
    <div className="adm-field">
      <div className="adm-field__top">
        <label htmlFor={id}>{label}</label>
        {count && <span className="adm-field__count">{count}</span>}
      </div>
      {control}
      {hint && <small className="adm-field__hint">{hint}</small>}
    </div>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Uploads to /api/admin/upload-image and hands back the stored URL
// (/uploads/<folder>/<file>). Only that URL is ever saved to MongoDB.
export function ImageInput({ label, value, onChange, folder = "images", aspect = "16 / 9", allowClear = false }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Image too large — please use one under 8MB");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const { data } = await axios.post("/api/admin/upload-image", { image: dataUrl, folder });
      onChange(data.url);
    } catch (err) {
      setError(err?.response?.data?.error || "Upload failed — try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-field">
      {label && (
        <div className="adm-field__top">
          <label>{label}</label>
        </div>
      )}
      <div className="adm-image" style={{ aspectRatio: aspect }}>
        {value ? <img src={value} alt="" /> : <span className="adm-image__empty"><FaImage /> No image</span>}
        <div className="adm-image__overlay">
          <button type="button" className="adm-btn adm-btn--light" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <FaSpinner className="adm-spin" /> : <FaUpload />} {value ? "Replace" : "Upload"}
          </button>
          {allowClear && value && !busy && (
            <button type="button" className="adm-btn adm-btn--ghost-light" onClick={() => onChange("")}>
              <FaTrashAlt /> Remove
            </button>
          )}
        </div>
        {busy && <div className="adm-image__busy"><FaSpinner className="adm-spin" /> Uploading…</div>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />
      {error && <small className="adm-field__error">{error}</small>}
    </div>
  );
}

/* ---------------------------------------------------------------- modal */

export function Modal({ title, onClose, children, footer, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div className="adm-modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`adm-modal__panel ${wide ? "adm-modal__panel--wide" : ""}`}>
        <div className="adm-modal__head">
          <h2>{title}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="adm-modal__body">{children}</div>
        {footer && <div className="adm-modal__foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmModal({ title = "Are you sure?", message, confirmLabel = "Delete", onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const go = async () => {
    setBusy(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed — try again");
      setBusy(false);
    }
  };
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={busy} onClick={go}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="adm-confirm-text">{message}</p>
      <ErrorNote>{error}</ErrorNote>
    </Modal>
  );
}

/* ---------------------------------------------------------------- forms */

// Tracks a form's values against what was last loaded/saved so the page can
// show a "unsaved changes" bar and warn before leaving.
export function useForm(initial) {
  const [base, setBase] = useState(initial);
  const [values, setValues] = useState(initial);
  const dirty = useMemo(() => JSON.stringify(base) !== JSON.stringify(values), [base, values]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return {
    values,
    dirty,
    set: (name) => (v) => setValues((s) => ({ ...s, [name]: v })),
    setAll: setValues,
    load: (v) => {
      setBase(v);
      setValues(v);
    },
    commit: () => setBase(values),
    reset: () => setValues(base),
  };
}

export function SaveBar({ dirty, saving, onSave, onReset, label = "You have unsaved changes" }) {
  return (
    <div className={`adm-savebar ${dirty ? "is-visible" : ""}`} aria-hidden={!dirty}>
      <span>{label}</span>
      <div>
        <Button variant="ghost-light" onClick={onReset} disabled={saving}>Discard</Button>
        <Button variant="accent" loading={saving} onClick={onSave}>Save changes</Button>
      </div>
    </div>
  );
}
