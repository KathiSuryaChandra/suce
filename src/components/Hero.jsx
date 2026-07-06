import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// The right-hand hero panel cycles through these three collections.
// `match` finds the real Category by name (case-insensitive, partial
// match) so each slide links to a genuinely filtered /products page.
// If your category names don't contain these words, the slide falls
// back to the unfiltered shop page instead of a dead link — adjust
// `match` below to fit your actual category names if needed.
const SLIDES = [
  {
    match: 'western',
    slideClass: 'slide-western',
    label: 'COLLECTION / 01',
    title: 'Western Wear',
    tagline: 'Everyday edit for the young and the bold',
  },
  {
    match: 'saree',
    slideClass: 'slide-saree',
    label: 'COLLECTION / 02',
    title: 'Sarees',
    tagline: 'Festive drapes, woven for celebration',
  },
  {
    match: 'langa',
    slideClass: 'slide-langa',
    label: 'COLLECTION / 03',
    title: 'Langa Voni',
    tagline: 'Traditional half-sarees for little ones',
  },
]

const AUTO_ROTATE_MS = 4500

export default function Hero({ categories = [] }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length)
    }, AUTO_ROTATE_MS)
    return () => clearInterval(timer)
  }, [])

  function hrefFor(matchTerm) {
    const found = categories.find((c) => c.name?.toLowerCase().includes(matchTerm))
    return found ? `/products?category=${found.id}` : '/products'
  }

  const slide = SLIDES[active]

  return (
    <section className="suce-hero section">
      <div className="container-suce">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="eyebrow" style={{ color: '#b8bcc2' }}>New season catalog</span>
            <h1 className="suce-hero-headline mt-3 mb-4">
              Considered goods,<br />made to last.
            </h1>
            <p style={{ color: '#b8bcc2', maxWidth: 420, fontSize: '1.05rem' }} className="mb-4">
              A small, carefully chosen catalog — every piece selected for materials,
              construction, and the kind of quiet quality that holds up.
            </p>
            <div className="d-flex gap-3">
              <Link to="/products" className="btn btn-suce-primary" style={{ background: '#fff', color: '#0a0a0b', borderColor: '#fff' }}>
                Shop the catalog
              </Link>
              <Link to="/products?sort=newest" className="btn btn-suce-outline" style={{ color: '#fff', borderColor: '#6b6e76' }}>
                What's new
              </Link>
            </div>
          </div>
          <div className="col-lg-6">
            <Link to={hrefFor(slide.match)} className="d-block" style={{ textDecoration: 'none' }}>
              <div className={`suce-hero-panel ${slide.slideClass}`}>
                <div key={active}>
                  <span className="font-mono" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                    {slide.label}
                  </span>
                  <h3 className="font-display mt-1 mb-1" style={{ color: '#fff' }}>{slide.title}</h3>
                  <p className="mb-0" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>
                    {slide.tagline}
                  </p>
                </div>

                <div className="suce-hero-dots" onClick={(e) => e.preventDefault()}>
                  {SLIDES.map((s, i) => (
                    <button
                      key={s.title}
                      type="button"
                      aria-label={`Show ${s.title} slide`}
                      className={`suce-hero-dot ${i === active ? 'is-active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setActive(i)
                      }}
                    />
                  ))}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
