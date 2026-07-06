export default function LoadingSkeleton({ fullPage = false, rows = 1, height = 18 }) {
  if (fullPage) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="skeleton" style={{ width: 120, height: 120, borderRadius: '50%' }} />
      </div>
    )
  }
  return (
    <div className="d-flex flex-column gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height, width: '100%' }} />
      ))}
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card">
      <div className="skeleton" style={{ aspectRatio: '1 / 1' }} />
      <div className="product-card-body">
        <div className="skeleton" style={{ height: 10, width: '40%' }} />
        <div className="skeleton" style={{ height: 16, width: '85%' }} />
        <div className="skeleton" style={{ height: 16, width: '50%' }} />
      </div>
    </div>
  )
}
