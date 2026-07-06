export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const windowSize = 1
  for (let i = 0; i < totalPages; i += 1) {
    if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= windowSize) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <nav aria-label="Pagination" className="d-flex justify-content-center mt-4">
      <ul className="d-flex gap-1 list-unstyled mb-0">
        <li>
          <button
            className="btn btn-suce-ghost"
            disabled={page === 0}
            onClick={() => onChange(page - 1)}
            aria-label="Previous page"
          >
            <i className="bi bi-arrow-left" />
          </button>
        </li>
        {pages.map((p, idx) =>
          p === '…' ? (
            <li key={`ellipsis-${idx}`} className="d-flex align-items-center px-2 text-secondary">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                className="btn"
                onClick={() => onChange(p)}
                aria-current={p === page ? 'page' : undefined}
                style={{
                  width: 36,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  background: p === page ? 'var(--suce-ink)' : 'transparent',
                  color: p === page ? '#fff' : 'var(--suce-ink)',
                  border: '1px solid var(--suce-silver-light)',
                }}
              >
                {p + 1}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            className="btn btn-suce-ghost"
            disabled={page === totalPages - 1}
            onClick={() => onChange(page + 1)}
            aria-label="Next page"
          >
            <i className="bi bi-arrow-right" />
          </button>
        </li>
      </ul>
    </nav>
  )
}
