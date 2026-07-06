export default function RatingStars({ value = 0, count, size = '0.85rem', onRate }) {
  const stars = [1, 2, 3, 4, 5]
  const interactive = typeof onRate === 'function'

  return (
    <span className="d-inline-flex align-items-center gap-1" style={{ fontSize: size }}>
      {stars.map((star) => {
        const filled = star <= Math.round(value)
        return (
          <i
            key={star}
            className={filled ? 'bi bi-star-fill' : 'bi bi-star'}
            style={{
              color: filled ? '#0a0a0b' : '#b8bcc2',
              cursor: interactive ? 'pointer' : 'default',
            }}
            role={interactive ? 'button' : undefined}
            aria-label={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
            onClick={interactive ? () => onRate(star) : undefined}
          />
        )
      })}
      {typeof count === 'number' && (
        <span className="font-mono text-secondary ms-1" style={{ fontSize: '0.78em' }}>
          ({count})
        </span>
      )}
    </span>
  )
}
