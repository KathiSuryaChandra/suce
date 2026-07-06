// Builds a full, browser-loadable URL for an image path returned by the
// backend. Product images come back as a relative path like
// "/uploads/products/abc123_shirt.jpg", served by the Spring Boot app
// itself — not by the Vite dev server — so they need the backend's origin
// (not the frontend's, and not the "/api" suffix) prepended.
//
// Already-absolute URLs (e.g. https://... from external sources) are
// passed through unchanged, so this is safe to use everywhere regardless
// of where the image actually lives.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, '')

export function resolveImageUrl(path) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${BACKEND_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`
}
