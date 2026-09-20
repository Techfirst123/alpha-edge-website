import { FaPen } from "react-icons/fa";

// Pair with the "editable-hover-target" class (see index.css) on the
// existing content container — no extra wrapper element, so grid/flex
// layouts are unaffected. Only ever rendered when the viewer is admin.
export default function EditIconButton({ onClick, label = "Edit" }) {
  return (
    <button
      type="button"
      className="edit-icon-btn"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
    >
      <FaPen />
    </button>
  );
}
