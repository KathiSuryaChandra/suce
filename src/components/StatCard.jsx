export default function StatCard({ label, value, icon, trend }) {
  return (
    <div className="stat-card">
      <div className="d-flex align-items-start justify-content-between">
        <span className="eyebrow">{label}</span>
        {icon && <i className={`bi ${icon}`} style={{ color: 'var(--suce-silver)', fontSize: '1.2rem' }} />}
      </div>
      <div className="stat-value mt-2">{value}</div>
      {trend && (
        <div
          className="mt-1"
          style={{ fontSize: '0.78rem', color: trend.startsWith('-') ? 'var(--suce-danger)' : 'var(--suce-success)' }}
        >
          {trend}
        </div>
      )}
    </div>
  )
}
