import { useEffect, useMemo, useRef, useState } from "react";
import { FaBoxes, FaFileExcel, FaPen, FaPlus, FaSearch, FaSpinner, FaStar, FaTrashAlt } from "react-icons/fa";
import { placeholderProductCategories } from "../../data/placeholder";
import { imageFor } from "../../utils/productImage";
import {
  adminDeleteProduct,
  adminImportProducts,
  adminUpdateProduct,
  createProduct,
  errorText,
  getProducts,
} from "../api";
import { Badge, Button, Card, ConfirmModal, Empty, ErrorNote, Field, ImageInput, Loading, Modal, PageHeader, useToast } from "../ui";

const MAX_FEATURED = 10;
const CATEGORY_OPTIONS = placeholderProductCategories.map((c) => ({ value: c.key, label: c.label }));
const STOCK_OPTIONS = [
  { value: "in", label: "Available · 3-5 days" },
  { value: "order", label: "On request" },
];
const CONDITION_OPTIONS = [
  { value: "", label: "No badge" },
  { value: "new", label: "New" },
  { value: "refurb", label: "Refurbished" },
];

const EMPTY = {
  category: "switch",
  image: "",
  name: "",
  model: "",
  brand: "",
  short_description: "",
  condition: "",
  specs: "",
  warranty: "",
  stock: "in",
  featured: false,
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Products() {
  const toast = useToast();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const load = () =>
    getProducts()
      .then((list) => setProducts(list.sort((a, b) => (b.id || 0) - (a.id || 0))))
      .catch((e) => setError(errorText(e, "Failed to load products")));

  useEffect(() => {
    load();
  }, []);

  const featuredCount = products ? products.filter((p) => p.featured).length : 0;

  const shown = useMemo(() => {
    if (!products) return [];
    const term = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (!onlyFeatured || p.featured) &&
        (!term || [p.name, p.model, p.brand].some((v) => String(v || "").toLowerCase().includes(term)))
    );
  }, [products, q, cat, onlyFeatured]);

  const toggleFeatured = async (p) => {
    try {
      await adminUpdateProduct({ id: p.id, featured: !p.featured });
      setProducts((all) => all.map((x) => (x.id === p.id ? { ...x, featured: !p.featured } : x)));
    } catch (e) {
      toast(errorText(e, "Could not update"), "error");
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="The product catalogue on the Products page. Star a product to show it in the home page Top 10."
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowImport(true)}>
              <FaFileExcel /> Import from Excel
            </Button>
            <Button variant="accent" onClick={() => setEditing({ ...EMPTY })}>
              <FaPlus /> Add product
            </Button>
          </>
        }
      />
      <ErrorNote>{error}</ErrorNote>
      {!products && !error && <Loading />}

      {products && (
        <Card>
          <div className="adm-toolbar">
            <label className="adm-search">
              <FaSearch aria-hidden="true" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, model or brand…" />
            </label>
            <select className="adm-select" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="all">All categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <button type="button" className={`adm-chip ${onlyFeatured ? "is-active" : ""}`} onClick={() => setOnlyFeatured((v) => !v)}>
              <FaStar /> Top 10 ({featuredCount}/{MAX_FEATURED})
            </button>
            <span className="adm-muted adm-ml-auto">{shown.length} of {products.length}</span>
          </div>

          {shown.length === 0 ? (
            <Empty icon={<FaBoxes />} title="No products found">Try a different search or add a product.</Empty>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th style={{ width: 64 }} />
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Availability</th>
                    <th title="Show on home page">Top 10</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {shown.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="adm-thumb">{imageFor(p) ? <img src={imageFor(p)} alt="" /> : null}</span>
                      </td>
                      <td>
                        <strong className="adm-table__title">{p.name}</strong>
                        <span className="adm-table__sub">{p.model}</span>
                      </td>
                      <td>{p.brand}</td>
                      <td>{p.category_label}</td>
                      <td>{p.stock === "order" ? <Badge>On request</Badge> : <Badge tone="green">Available</Badge>}</td>
                      <td>
                        <button
                          type="button"
                          className={`adm-star ${p.featured ? "is-on" : ""}`}
                          onClick={() => toggleFeatured(p)}
                          aria-label={p.featured ? "Remove from home page" : "Show on home page"}
                          title={p.featured ? "Shown on home page" : "Show on home page"}
                        >
                          <FaStar />
                        </button>
                      </td>
                      <td className="adm-table__tools">
                        <button type="button" className="adm-icon-btn" onClick={() => setEditing(p)} aria-label="Edit"><FaPen /></button>
                        <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => setConfirm(p)} aria-label="Delete"><FaTrashAlt /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {editing && (
        <ProductForm
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved, isNew) => {
            setProducts((all) => (isNew ? [saved, ...all] : all.map((x) => (x.id === saved.id ? { ...x, ...saved } : x))));
            toast(isNew ? "Product added" : "Product saved");
          }}
        />
      )}

      {confirm && (
        <ConfirmModal
          title="Delete this product?"
          message={`“${confirm.name}” will be removed from the website.`}
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            await adminDeleteProduct(confirm.id);
            setProducts((all) => all.filter((x) => x.id !== confirm.id));
            toast("Product deleted");
          }}
        />
      )}

      {showImport && <ImportModal onClose={() => setShowImport(false)} onImported={load} />}
    </>
  );
}

function ProductForm({ product, onClose, onSaved }) {
  const isNew = !product.id;
  const [v, setV] = useState({ ...EMPTY, ...product, image: product.image || "", stock: product.stock === "order" ? "order" : "in" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (val) => setV((s) => ({ ...s, [k]: val }));

  const submit = async () => {
    setSaving(true);
    setError("");
    const payload = {
      image: v.image,
      name: v.name,
      model: v.model,
      brand: v.brand,
      short_description: v.short_description,
      condition: v.condition,
      specs: v.specs,
      warranty: v.warranty,
      stock: v.stock,
    };
    try {
      if (isNew) {
        const created = await createProduct({ ...payload, category: v.category });
        onSaved(created, true);
      } else {
        await adminUpdateProduct({ id: product.id, ...payload, category_label: v.category_label, featured: v.featured });
        onSaved({ ...product, ...payload, category_label: v.category_label, featured: v.featured }, false);
      }
      onClose();
    } catch (e) {
      setError(errorText(e, "Save failed"));
      setSaving(false);
    }
  };

  return (
    <Modal
      wide
      title={isNew ? "Add product" : `Edit ${product.name}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="accent" loading={saving} disabled={!v.name.trim()} onClick={submit}>{isNew ? "Add product" : "Save changes"}</Button>
        </>
      }
    >
      <div className="adm-product-form">
        <div>
          <ImageInput label="Photo" value={v.image || (isNew ? "" : imageFor(product))} onChange={set("image")} folder="products" aspect="4 / 3" />
          {!v.image && !isNew && <small className="adm-field__hint">Showing the category's stock photo until you upload one.</small>}
        </div>
        <div className="adm-form-grid">
          <div className="adm-span-2">
            <Field label="Product name" value={v.name} onChange={set("name")} maxLength={160} />
          </div>
          <Field label="Model / SKU" value={v.model} onChange={set("model")} maxLength={80} />
          <Field label="Brand" value={v.brand} onChange={set("brand")} maxLength={80} />
          {isNew ? (
            <Field label="Category" type="select" options={CATEGORY_OPTIONS} value={v.category} onChange={set("category")} />
          ) : (
            <Field label="Category label" value={v.category_label} onChange={set("category_label")} maxLength={80} hint="Category filter can't be changed after creation" />
          )}
          <Field label="Availability" type="select" options={STOCK_OPTIONS} value={v.stock} onChange={set("stock")} />
          <div className="adm-span-2">
            <Field label="Short description" type="textarea" rows={3} value={v.short_description} onChange={set("short_description")} maxLength={300} />
          </div>
          <Field label="Condition badge" type="select" options={CONDITION_OPTIONS} value={v.condition} onChange={set("condition")} />
          <Field label="Warranty line" value={v.warranty} onChange={set("warranty")} maxLength={80} placeholder="e.g. Warranty included" />
          <div className="adm-span-2">
            <Field label="Spec chips" value={v.specs} onChange={set("specs")} maxLength={120} hint="Comma separated, e.g. 48, UPOE" />
          </div>
          {!isNew && (
            <div className="adm-span-2">
              <Field type="checkbox" label="Show in the home page Top 10" hint="Maximum 10 products" value={v.featured} onChange={set("featured")} />
            </div>
          )}
        </div>
      </div>
      <ErrorNote>{error}</ErrorNote>
    </Modal>
  );
}

function ImportModal({ onClose, onImported }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileName(file.name);
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await adminImportProducts(await fileToDataUrl(file));
      setResult(res);
      if (res.imported > 0 || res.updated > 0) onImported();
    } catch (err) {
      setError(errorText(err, "Import failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Import products from Excel" onClose={onClose} footer={<Button variant="ghost" onClick={onClose}>Close</Button>}>
      <p className="adm-muted">
        Upload an <strong>.xlsx</strong> file with a header row. Recognised columns: <code>category</code>, <code>category_label</code>,{" "}
        <code>brand</code>, <code>name</code>, <code>model</code>, <code>short_description</code>, <code>stock</code> (in/order),{" "}
        <code>lead_time</code>, <code>image</code>, <code>featured</code> (yes/no). Existing products with the same model are updated.
      </p>
      <button type="button" className="adm-drop" onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? <FaSpinner className="adm-spin" /> : <FaFileExcel />}
        <span>{busy ? "Importing — photos may take a moment…" : fileName || "Choose an .xlsx file"}</span>
      </button>
      <input ref={ref} type="file" accept=".xlsx" hidden onChange={pick} />
      <ErrorNote>{error}</ErrorNote>
      {result && (
        <div className="adm-import-result">
          <p>
            <strong>{result.imported}</strong> added · <strong>{result.updated}</strong> updated
            {result.errors?.length > 0 && (
              <>
                {" "}· <strong>{result.errors.length}</strong> skipped
              </>
            )}
          </p>
          {result.errors?.length > 0 && (
            <ul>
              {result.errors.map((e, i) => (
                <li key={i}>Row {e.row}: {e.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}
