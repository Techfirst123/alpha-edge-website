import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaPlus, FaTrashAlt } from "react-icons/fa";
import { DEFAULT_CATEGORIES } from "../../data/contentDefaults";
import { adminUpdateSupplyCategories, errorText, getSupplyCategories } from "../api";
import { Button, Card, Loading, PageHeader, SaveBar, useForm, useToast } from "../ui";

export default function SupplyCategories() {
  const toast = useToast();
  const form = useForm(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSupplyCategories()
      .then((d) => form.load({ list: d.categories?.length ? d.categories : DEFAULT_CATEGORIES }))
      .catch(() => form.load({ list: DEFAULT_CATEGORIES }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!form.values) return <Loading />;
  const list = form.values.list;
  const setList = (next) => form.setAll({ list: next });
  const update = (i, key, value) => setList(list.map((c, j) => (j === i ? { ...c, [key]: value } : c)));
  const move = (i, dir) => {
    const next = [...list];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setList(next);
  };

  const save = async () => {
    const clean = list.filter((c) => c.label.trim());
    setSaving(true);
    try {
      await adminUpdateSupplyCategories(clean);
      form.load({ list: clean });
      toast("Categories saved");
    } catch (e) {
      toast(errorText(e, "Save failed"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="What we supply" subtitle="The category tiles in the “What We Supply” section of the home page." />
      <Card
        title={`${list.length} categories`}
        actions={
          <Button variant="ghost" onClick={() => setList([...list, { label: "", sub: "" }])}>
            <FaPlus /> Add category
          </Button>
        }
      >
        <div className="adm-rows">
          <div className="adm-rows__head">
            <span>Category name</span>
            <span>Short description</span>
            <span />
          </div>
          {list.map((c, i) => (
            <div className="adm-rows__row" key={i}>
              <input value={c.label} maxLength={60} placeholder="e.g. Network Switches" onChange={(e) => update(i, "label", e.target.value)} />
              <input value={c.sub} maxLength={120} placeholder="e.g. Access to core, GbE–100G" onChange={(e) => update(i, "sub", e.target.value)} />
              <div className="adm-rows__tools">
                <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><FaArrowUp /></button>
                <button type="button" className="adm-icon-btn" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><FaArrowDown /></button>
                <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => setList(list.filter((_, j) => j !== i))} aria-label="Remove"><FaTrashAlt /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <SaveBar dirty={form.dirty} saving={saving} onSave={save} onReset={form.reset} />
    </>
  );
}
