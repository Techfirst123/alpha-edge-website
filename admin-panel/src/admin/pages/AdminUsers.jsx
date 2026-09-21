import { useEffect, useState } from "react";
import { FaPlus, FaTrashAlt, FaUserShield } from "react-icons/fa";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { formatDate } from "../../utils/formatDate";
import { adminCreateAdmin, adminDeleteAdmin, adminListAdmins, adminUpdateAdminRole, errorText } from "../api";
import { Badge, Button, Card, ConfirmModal, ErrorNote, Field, Loading, Modal, PageHeader, useToast } from "../ui";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin — can edit content" },
  { value: "superadmin", label: "Super Admin — can also manage admins" },
];

export default function AdminUsers() {
  const toast = useToast();
  const { adminEmail } = useAdminAuth();
  const [admins, setAdmins] = useState(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = () => adminListAdmins().then(setAdmins).catch((e) => setError(errorText(e, "Failed to load admins")));
  useEffect(() => {
    load();
  }, []);

  const changeRole = async (a, role) => {
    try {
      await adminUpdateAdminRole(a.id, role);
      setAdmins((all) => all.map((x) => (x.id === a.id ? { ...x, role } : x)));
      toast(`${a.name} is now ${role === "superadmin" ? "a Super Admin" : "an Admin"}`);
    } catch (e) {
      toast(errorText(e, "Could not change role"), "error");
    }
  };

  return (
    <>
      <PageHeader
        title="Admin users"
        subtitle="People who can sign in to this panel."
        actions={
          <Button variant="accent" onClick={() => setAdding(true)}>
            <FaPlus /> Add admin
          </Button>
        }
      />
      <ErrorNote>{error}</ErrorNote>
      {!admins && !error && <Loading />}
      {admins && (
        <Card>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Added</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => {
                  const me = a.email === adminEmail;
                  return (
                    <tr key={a.id}>
                      <td>
                        <strong>{a.name}</strong> {me && <Badge tone="blue">You</Badge>}
                      </td>
                      <td>{a.email}</td>
                      <td>
                        {me ? (
                          <Badge tone="amber">{a.role === "superadmin" ? "Super Admin" : "Admin"}</Badge>
                        ) : (
                          <select className="adm-select adm-select--sm" value={a.role} onChange={(e) => changeRole(a, e.target.value)}>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                          </select>
                        )}
                      </td>
                      <td>{a.createdAt ? formatDate(a.createdAt) : "—"}</td>
                      <td className="adm-table__tools">
                        {!me && (
                          <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => setConfirm(a)} aria-label="Remove admin">
                            <FaTrashAlt />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {adding && (
        <AddAdmin
          onClose={() => setAdding(false)}
          onCreated={(a) => {
            setAdmins((all) => [...all, a]);
            toast(`${a.name} can now sign in`);
          }}
        />
      )}
      {confirm && (
        <ConfirmModal
          title="Remove this admin?"
          message={`${confirm.name} (${confirm.email}) will no longer be able to sign in.`}
          confirmLabel="Remove"
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            await adminDeleteAdmin(confirm.id);
            setAdmins((all) => all.filter((x) => x.id !== confirm.id));
            toast("Admin removed");
          }}
        />
      )}
    </>
  );
}

function AddAdmin({ onClose, onCreated }) {
  const [v, setV] = useState({ name: "", email: "", password: "", role: "admin" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (val) => setV((s) => ({ ...s, [k]: val }));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const created = await adminCreateAdmin(v);
      onCreated(created);
      onClose();
    } catch (e) {
      setError(errorText(e, "Could not create admin"));
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Add admin"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="accent" loading={saving} onClick={submit}>
            <FaUserShield /> Create admin
          </Button>
        </>
      }
    >
      <div className="adm-stack">
        <Field label="Full name" value={v.name} onChange={set("name")} maxLength={80} />
        <Field label="Email" type="email" value={v.email} onChange={set("email")} maxLength={200} />
        <Field label="Password" type="password" value={v.password} onChange={set("password")} hint="At least 8 characters. Share it with them securely." />
        <Field label="Role" type="select" options={ROLE_OPTIONS} value={v.role} onChange={set("role")} />
      </div>
      <ErrorNote>{error}</ErrorNote>
    </Modal>
  );
}
