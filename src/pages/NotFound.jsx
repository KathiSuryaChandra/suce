import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-suce section text-center">
      <span className="eyebrow">404</span>
      <h2 className="mt-1 mb-3">This page wandered off</h2>
      <p className="text-secondary mb-4">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn btn-suce-primary">Back to home</Link>
    </div>
  )
}
