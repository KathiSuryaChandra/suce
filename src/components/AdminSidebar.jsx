import { NavLink } from 'react-router-dom'
import logoLight from '../assets/logo-light.png'

const links = [
  { to: '/admin', label: 'Dashboard', icon: 'bi-speedometer2', end: true },
  { to: '/admin/products', label: 'Products', icon: 'bi-box-seam' },
  { to: '/admin/categories', label: 'Categories', icon: 'bi-tags' },
  { to: '/admin/orders', label: 'Orders', icon: 'bi-receipt' },
  { to: '/admin/users', label: 'Users', icon: 'bi-people' },
]

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="px-4 mb-4">
        <img src={logoLight} alt="SUCE" className="suce-logo-mark" style={{ height: 26 }} />
        <div className="eyebrow mt-1">Admin</div>
      </div>
      <nav className="d-flex flex-column gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `admin-sidebar-link${isActive ? ' active' : ''}`}
          >
            <i className={`bi ${l.icon}`} />
            {l.label}
          </NavLink>
        ))}
      </nav>
      <hr className="hairline my-3 mx-4" style={{ borderColor: '#2b2c2f' }} />
      <NavLink to="/" className="admin-sidebar-link">
        <i className="bi bi-arrow-left" />
        Back to store
      </NavLink>
    </aside>
  )
}
