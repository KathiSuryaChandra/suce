import { Link } from 'react-router-dom'

export default function EmptyState({ icon = 'bi-inbox', title, message, actionLabel, actionTo }) {
  return (
    <div className="text-center py-5 my-4">
      <i className={`bi ${icon}`} style={{ fontSize: '2.4rem', color: '#b8bcc2' }} />
      <h4 className="mt-3 mb-2">{title}</h4>
      {message && <p className="text-secondary mb-4" style={{ maxWidth: 420, margin: '0 auto' }}>{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-suce-primary mt-2">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
