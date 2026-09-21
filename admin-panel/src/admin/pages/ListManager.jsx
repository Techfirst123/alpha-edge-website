import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaPen, FaPlus, FaTrashAlt } from "react-icons/fa";
import { createItem, deleteItem, errorText, listItems, reorderItems, updateItem } from "../api";
import { Button, Card, ConfirmModal, Empty, ErrorNote, Field, Loading, Modal, useToast } from "../ui";

// Add / edit / delete / reorder for a list collection (services, team).
//   fields: [{ name, label, type, maxLength, options, hint }]
//   renderItem(item) -> JSX summary shown in the list
export default function ListManager({ collection, noun, fields, renderItem, emptyText, seed = [] }) {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // item | {} for new
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    listItems(collection)
      .then(setItems)
      .catch((e) => setError(errorText(e, `Failed to load ${collection}`)));
  }, [collection]);

  const move = async (i, dir) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setItems(next);
    try {
      await reorderItems(collection, next.map((x) => x.id));
    } catch (e) {
      toast(errorText(e, "Could not save the new order"), "error");
    }
  };

  const importDefaults = async () => {
    try {
      const created = [];
      for (const s of seed) created.push(await createItem(collection, s));
      setItems(created);
      toast(`${created.length} ${noun.toLowerCase()} entries added`);
    } catch (e) {
      toast(errorText(e, "Import failed"), "error");
    }
  };

  return (
    <Card
      title={items ? `${items.length} ${items.length === 1 ? noun.toLowerCase() : `${noun.toLowerCase()}s`}` : noun}
      actions={
        <Button variant="accent" onClick={() => setEditing({})}>
          <FaPlus /> Add {noun.toLowerCase()}
        </Button>
      }
    >
      <ErrorNote>{error}</ErrorNote>
      {!items && !error && <Loading />}
      {items && items.length === 0 && (
        <Empty title={`No ${noun.toLowerCase()} entries in the database yet`}>
          {emptyText}
          {seed.length > 0 && (
            <>
              <br />
              <Button variant="ghost" className="adm-mt-sm" onClick={importDefaults}>
                Start from the website's current {noun.toLowerCase()} list
              </Button>
            </>
          )}
        </Empty>
      )}
      {items && items.length > 0 && (
        <ul className="adm-list">
          {items.map((item, i) => (
            <li key={item.id} className="adm-list__item">
              <div className="adm-list__main">{renderItem(item)}</div>
              <div className="adm-list__tools">
                <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><FaArrowUp /></button>
                <button type="button" className="adm-icon-btn" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><FaArrowDown /></button>
                <button type="button" className="adm-icon-btn" onClick={() => setEditing(item)} aria-label="Edit"><FaPen /></button>
                <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => setConfirm(item)} aria-label="Delete"><FaTrashAlt /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ItemForm
          noun={noun}
          fields={fields}
          item={editing}
          onClose={() => setEditing(null)}
          onSave={async (values) => {
            if (editing.id) {
              await updateItem(collection, { id: editing.id, ...values });
              setItems((all) => all.map((x) => (x.id === editing.id ? { ...x, ...values } : x)));
              toast(`${noun} updated`);
            } else {
              const created = await createItem(collection, values);
              setItems((all) => [...all, created]);
              toast(`${noun} added`);
            }
          }}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={`Delete this ${noun.toLowerCase()}?`}
          message="It will be removed from the website straight away."
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            await deleteItem(collection, confirm.id);
            setItems((all) => all.filter((x) => x.id !== confirm.id));
            toast(`${noun} deleted`);
          }}
        />
      )}
    </Card>
  );
}

function ItemForm({ noun, fields, item, onClose, onSave }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, item[f.name] ?? (f.options ? f.options[0].value : "")]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave(values);
      onClose();
    } catch (e) {
      setError(errorText(e, "Save failed"));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={item.id ? `Edit ${noun.toLowerCase()}` : `Add ${noun.toLowerCase()}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="accent" loading={saving} onClick={submit}>{item.id ? "Save changes" : `Add ${noun.toLowerCase()}`}</Button>
        </>
      }
    >
      <div className="adm-stack">
        {fields.map((f) => (
          <Field
            key={f.name}
            label={f.label}
            type={f.type}
            options={f.options}
            maxLength={f.maxLength}
            hint={f.hint}
            rows={3}
            value={values[f.name]}
            onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))}
          />
        ))}
      </div>
      <ErrorNote>{error}</ErrorNote>
    </Modal>
  );
}
