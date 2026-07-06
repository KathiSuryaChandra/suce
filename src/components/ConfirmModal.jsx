export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: 'rgba(10,10,11,0.45)', zIndex: 1000 }}
      onClick={onCancel}
    >
      <div
        className="card-suce p-4 fade-in"
        style={{ width: 360, maxWidth: '90vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h5 className="mb-2">{title}</h5>
        {message && <p className="text-secondary mb-4">{message}</p>}
        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-suce-outline" onClick={onCancel}>Cancel</button>
          <button
            className={danger ? 'btn btn-suce-danger' : 'btn btn-suce-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
