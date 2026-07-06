import { Link } from 'react-router-dom'
import logoLight from '../assets/logo-light.png'

export default function Footer() {
  return (
    <footer className="suce-footer mt-auto">
      <div className="container-suce py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <Link to="/" aria-label="SUCE — home" className="d-inline-block mb-3">
              <img src={logoLight} alt="SUCE" className="suce-logo-mark" />
            </Link>
            <p style={{ color: '#8c8f96', maxWidth: 280, fontSize: '0.9rem' }}>
              Considered goods, made to last. A small catalog, chosen carefully.
            </p>
          </div>
          <div className="col-6 col-md-2">
            <span className="eyebrow d-block mb-3">Shop</span>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.88rem' }}>
              <li><Link to="/products">All products</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/orders">Track an order</Link></li>
            </ul>
          </div>
          <div className="col-6 col-md-2">
            <span className="eyebrow d-block mb-3">Account</span>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.88rem' }}>
              <li><Link to="/login">Sign in</Link></li>
              <li><Link to="/register">Create account</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>
          <div className="col-md-4">
            <span className="eyebrow d-block mb-3">Stay in touch</span>
            <p style={{ color: '#8c8f96', fontSize: '0.85rem' }}>support@suce.example</p>
          </div>
        </div>
        <hr className="hairline my-4" style={{ borderColor: '#2b2c2f' }} />
        <div className="d-flex flex-column flex-md-row justify-content-between gap-2" style={{ fontSize: '0.78rem', color: '#6b6e76' }}>
          <span>© {new Date().getFullYear()} SUCE. All rights reserved.</span>
          <span className="font-mono">Built with care.</span>
        </div>
      </div>
    </footer>
  )
}
