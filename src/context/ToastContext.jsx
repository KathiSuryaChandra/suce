import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const notify = useCallback(
    (message, variant = 'success', duration = 3500) => {
      const id = ++idCounter
      setToasts((prev) => [...prev, { id, message, variant }])
      timers.current[id] = setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss],
  )

  const value = {
    success: (msg) => notify(msg, 'success'),
    error: (msg) => notify(msg, 'danger'),
    info: (msg) => notify(msg, 'secondary'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 340,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="fade-in"
            role="status"
            style={{
              background: t.variant === 'danger' ? '#b3261e' : '#0a0a0b',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: 4,
              fontSize: '0.88rem',
              boxShadow: '0 12px 32px rgba(10,10,11,0.25)',
              cursor: 'pointer',
            }}
            onClick={() => dismiss(t.id)}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
