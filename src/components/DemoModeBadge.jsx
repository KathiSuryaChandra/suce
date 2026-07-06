import { DEMO_MODE } from '../demo/config'
import { resetDemoData } from '../demo/storage'
import { useToast } from '../context/ToastContext.jsx'

export default function DemoModeBadge() {
  const toast = useToast()

  if (!DEMO_MODE) return null

  function handleReset() {
    if (!window.confirm('Reset all demo data? (cart, orders, wishlist, and any products/categories you edited will be cleared)')) return
    resetDemoData()
    toast.success('Demo data reset — refreshing…')
    setTimeout(() => window.location.reload(), 900)
  }

  return (
    <div className="suce-demo-badge" title="Running in demo mode — no real backend needed">
      <i className="bi bi-lightning-charge-fill" />
      DEMO MODE
      <button
        onClick={handleReset}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.55)',
          fontSize: '0.7rem',
          cursor: 'pointer',
          padding: 0,
          marginLeft: 4,
        }}
        title="Reset demo data"
        aria-label="Reset demo data"
      >
        reset
      </button>
    </div>
  )
}
