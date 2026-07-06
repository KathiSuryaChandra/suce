import { useEffect, useState } from 'react'

const SESSION_KEY = 'suce_intro_seen'

export default function BrandIntro() {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [skipReady, setSkipReady] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const alreadySeen = sessionStorage.getItem(SESSION_KEY)

    if (prefersReducedMotion || alreadySeen) {
      sessionStorage.setItem(SESSION_KEY, '1')
      return
    }

    setVisible(true)
    sessionStorage.setItem(SESSION_KEY, '1')

    const skipTimer = setTimeout(() => setSkipReady(true), 600)
    return () => clearTimeout(skipTimer)
  }, [])

  function dismiss() {
    if (closing) return
    setClosing(true)
    // matches the CSS transition duration below
    setTimeout(() => setVisible(false), 650)
  }

  if (!visible) return null

  return (
    <div
      className={`suce-intro${closing ? ' suce-intro-closing' : ''}`}
      role="dialog"
      aria-label="Welcome to SUCE"
    >
      <video
        className="suce-intro-video"
        src="/brand-intro.mp4"
        poster="/brand-intro-poster.jpg"
        autoPlay
        muted
        playsInline
        onEnded={dismiss}
      />

      {skipReady && (
        <button className="suce-intro-skip" onClick={dismiss}>
          Skip <i className="bi bi-arrow-right ms-1" />
        </button>
      )}
    </div>
  )
}
