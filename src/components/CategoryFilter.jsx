export default function CategoryFilter({ categories, selectedId, onSelect }) {
  return (
    <div>
      <span className="eyebrow d-block mb-3">Category</span>
      <ul className="list-unstyled d-flex flex-column gap-2">
        <li>
          <button
            className="btn btn-suce-ghost p-0"
            style={{ fontWeight: !selectedId ? 600 : 400, color: !selectedId ? 'var(--suce-ink)' : undefined }}
            onClick={() => onSelect(null)}
          >
            All products
          </button>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <button
              className="btn btn-suce-ghost p-0"
              style={{
                fontWeight: selectedId === c.id ? 600 : 400,
                color: selectedId === c.id ? 'var(--suce-ink)' : undefined,
              }}
              onClick={() => onSelect(c.id)}
            >
              {c.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
