function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount ?? 0)
}

export default function PriceTag({ price, discountPrice, size = '1rem' }) {
  const hasDiscount = discountPrice != null && discountPrice < price
  const pct = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0

  return (
    <span className="price-tag" style={{ fontSize: size }}>
      {formatCurrency(hasDiscount ? discountPrice : price)}
      {hasDiscount && (
        <>
          <span className="price-strike">{formatCurrency(price)}</span>
          <span className="price-discount">-{pct}%</span>
        </>
      )}
    </span>
  )
}

export { formatCurrency }
