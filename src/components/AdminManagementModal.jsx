import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaUserShield, FaUser, FaPlus, FaTrashAlt } from "react-icons/fa";
import { useAdminAuth } from "../hooks/useAdminAuth";
import {
  adminListAdmins, adminCreateAdmin, adminUpdateAdminRole, adminDeleteAdmin,
} from "../api/client";
import { formatDate } from "../utils/formatDate";
import "./EditModal.css";
import "./AdminManagementModal.css";

const EMPTY_FORM = { name: "", email: "", password: "", role: "admin" };

export default function AdminManagementModal({ onClose }) {
  const { adminEmail } = useAdminAuth();
  const [admins, setAdmins] = useState(null);
  const [loadError, setLoadError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [roleUpdatingId, setRoleUpdatingId] = useState(null);
  const [rowError, setRowError] = useState({});

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    adminListAdmins().then(setAdmins).catch((err) => setLoadError(err?.response?.data?.error || "Failed to load admins"));
  };

  useEffect(load, []);

  const setRowErr = (id, msg) => setRowError((prev) => ({ ...prev, [id]: msg }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!form.name.trim()) return setCreateError("Name is required");
    if (!form.email.trim()) return setCreateError("Email is required");
    if (form.password.length < 8) return setCreateError("Password must be at least 8 characters");

    setCreating(true);
    try {
      const created = await adminCreateAdmin(form);
      setAdmins((prev) => [...(prev || []), created]);
      setForm(EMPTY_FORM);
      setShowCreate(false);
    } catch (err) {
      setCreateError(err?.response?.data?.error || "Failed to create admin");
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (admin, newRole) => {
    if (newRole === admin.role) return;
    setRowErr(admin.id, "");
    setRoleUpdatingId(admin.id);
    try {
      await adminUpdateAdminRole(admin.id, newRole);
      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? { ...a, role: newRole } : a)));
    } catch (err) {
      setRowErr(admin.id, err?.response?.data?.error || "Failed to update role");
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const handleDelete = async (admin) => {
    setRowErr(admin.id, "");
    setDeletingId(admin.id);
    try {
      await adminDeleteAdmin(admin.id);
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      setConfirmDeleteId(null);
    } catch (err) {
      setRowErr(admin.id, err?.response?.data?.error || "Failed to delete admin");
    } finally {
      setDeletingId(null);
    }
  };

  return createPortal(
    <div className="edit-modal-backdrop" onClick={onClose}>
      <div
        className="edit-modal edit-modal--wide admin-mgmt"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Admin Management"
      >
        <div className="edit-modal__head">
          <h3>Admin Management</h3>
          <button type="button" className="edit-modal__close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <div className="edit-modal__body admin-mgmt__body">
          {loadError && <p className="field-error">{loadError}</p>}
          {!admins && !loadError && <p className="dash-loading">Loading…</p>}

          {admins && (
            <>
              {!showCreate ? (
                <button type="button" className="admin-mgmt__add-btn" onClick={() => setShowCreate(true)}>
                  <FaPlus /> Create Admin
                </button>
              ) : (
                <form className="admin-mgmt__form" onSubmit={handleCreate}>
                  <div className="admin-mgmt__form-grid">
                    <input
                      placeholder="Name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      maxLength={80}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      maxLength={200}
                    />
                    <input
                      type="password"
                      placeholder="Password (min 8 characters)"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    />
                    <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                  {createError && <p className="field-error">{createError}</p>}
                  <div className="admin-mgmt__form-actions">
                    <button
                      type="button"
                      className="edit-modal__cancel"
                      onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); setCreateError(""); }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="edit-modal__save" disabled={creating}>
                      {creating ? "Creating…" : "Create Admin"}
                    </button>
                  </div>
                </form>
              )}

              <div className="admin-mgmt__list">
                {admins.map((a) => (
                  <div className="admin-mgmt__row" key={a.id}>
                    <div className="admin-mgmt__row-icon">
                      {a.role === "superadmin" ? <FaUserShield /> : <FaUser />}
                    </div>
                    <div className="admin-mgmt__row-info">
                      <span className="admin-mgmt__row-name">
                        {a.name} {a.email === adminEmail && <span className="admin-mgmt__you">(you)</span>}
                      </span>
                      <span className="admin-mgmt__row-email">{a.email}</span>
                      {a.createdAt && <span className="admin-mgmt__row-date">Added {formatDate(a.createdAt)}</span>}
                    </div>

                    {confirmDeleteId === a.id ? (
                      <div className="admin-mgmt__confirm">
                        <span>Delete this admin?</span>
                        <button type="button" className="edit-modal__cancel" onClick={() => setConfirmDeleteId(null)}>
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="edit-modal__delete-confirm"
                          onClick={() => handleDelete(a)}
                          disabled={deletingId === a.id}
                        >
                          {deletingId === a.id ? "Deleting…" : "Yes, Delete"}
                        </button>
                      </div>
                    ) : (
                      <div className="admin-mgmt__row-actions">
                        <select
                          value={a.role}
                          disabled={roleUpdatingId === a.id}
                          onChange={(e) => handleRoleChange(a, e.target.value)}
                        >
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                        {a.email !== adminEmail && (
                          <button
                            type="button"
                            className="admin-mgmt__delete-btn"
                            onClick={() => setConfirmDeleteId(a.id)}
                            aria-label={`Delete ${a.name}`}
                            title="Delete"
                          >
                            <FaTrashAlt />
                          </button>
                        )}
                      </div>
                    )}
                    {rowError[a.id] && <p className="field-error admin-mgmt__row-error">{rowError[a.id]}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
