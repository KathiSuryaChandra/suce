import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import logoLight from '../assets/logo-light.png'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    navigate(query.trim() ? `/products?search=${encodeURIComponent(query.trim())}` : '/products')
    setMenuOpen(false)
  }

  async function handleLogout() {
    await logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  const navLinkClass = ({ isActive }) => `suce-nav-link${isActive ? ' active' : ''}`

  return (
    <header className="suce-navbar">
      <div className="container-suce d-flex align-items-center justify-content-between" style={{ height: 64 }}>
        <div className="d-flex align-items-center gap-4">
          <Link to="/" aria-label="SUCE — home">
            <img src={logoLight} alt="SUCE" className="suce-logo-mark" />
          </Link>
          <nav className="d-none d-lg-flex align-items-center gap-4">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/products" className={navLinkClass}>Shop</NavLink>
            {isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
          </nav>
        </div>

        <form onSubmit={handleSearch} className="d-none d-md-flex flex-grow-1 mx-4" style={{ maxWidth: 380 }}>
          <div className="position-relative w-100">
            <input
              type="search"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-control-suce"
              style={{ background: '#1e1f22', borderColor: '#3a3b3f', color: '#fff', paddingLeft: 36 }}
              aria-label="Search products"
            />
            <i className="bi bi-search position-absolute" style={{ left: 12, top: 11, color: '#b8bcc2' }} />
          </div>
        </form>

        <div className="d-flex align-items-center gap-3">
          <Link to="/wishlist" className="suce-icon-btn" aria-label="Wishlist">
            <i className="bi bi-heart" />
          </Link>
          <Link to="/cart" className="suce-icon-btn position-relative" aria-label="Cart">
            <i className="bi bi-bag" />
            {totalItems > 0 && <span className="suce-badge-count">{totalItems}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="position-relative">
              <button
                className="suce-icon-btn d-flex align-items-center gap-1 border-0 bg-transparent"
                onClick={() => setUserMenuOpen((o) => !o)}
              >
                <i className="bi bi-person-circle" />
              </button>
              {userMenuOpen && (
                <div
                  className="card-suce position-absolute end-0 mt-2 py-2"
                  style={{ width: 200, zIndex: 60 }}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 text-secondary" style={{ fontSize: '0.8rem' }}>
                    Signed in as<br /><strong className="text-dark">{user?.firstName || user?.email}</strong>
                  </div>
                  <hr className="hairline my-1" />
                  <Link to="/profile" className="d-block px-3 py-2 text-dark" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                  <Link to="/orders" className="d-block px-3 py-2 text-dark" onClick={() => setUserMenuOpen(false)}>Orders</Link>
                  {isAdmin && (
                    <Link to="/admin" className="d-block px-3 py-2 text-dark" onClick={() => setUserMenuOpen(false)}>Admin Dashboard</Link>
                  )}
                  <hr className="hairline my-1" />
                  <button className="d-block w-100 text-start px-3 py-2 bg-transparent border-0 text-danger" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-suce-outline" style={{ borderColor: '#b8bcc2', color: '#fff' }}>
              Sign in
            </Link>
          )}

          <button
            className="d-lg-none suce-icon-btn border-0 bg-transparent"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <i className={menuOpen ? 'bi bi-x-lg' : 'bi bi-list'} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="d-lg-none px-3 pb-3">
          <form onSubmit={handleSearch} className="mb-3">
            <input
              type="search"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-control-suce"
              style={{ background: '#1e1f22', borderColor: '#3a3b3f', color: '#fff' }}
            />
          </form>
          <nav className="d-flex flex-column gap-3">
            <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/products" className={navLinkClass} onClick={() => setMenuOpen(false)}>Shop</NavLink>
            {isAdmin && <NavLink to="/admin" className={navLinkClass} onClick={() => setMenuOpen(false)}>Admin</NavLink>}
          </nav>
        </div>
      )}
    </header>
  )
}
