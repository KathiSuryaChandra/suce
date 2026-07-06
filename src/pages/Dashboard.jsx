import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../../services/adminService'
import StatCard from '../../components/StatCard.jsx'
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx'
import { formatCurrency } from '../../components/PriceTag.jsx'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService
      .dashboardStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <span className="eyebrow">Overview</span>
      <h2 className="mt-1 mb-4">Dashboard</h2>

      {loading ? (
        <LoadingSkeleton rows={1} height={300} />
      ) : (
        <>
          <div className="row g-3 mb-5">
            <div className="col-6 col-lg-3">
              <StatCard label="Revenue (30d)" value={formatCurrency(stats?.revenueLast30Days ?? 0)} icon="bi-graph-up" trend={stats?.revenueTrend} />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard label="Orders (30d)" value={stats?.ordersLast30Days ?? 0} icon="bi-receipt" trend={stats?.ordersTrend} />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard label="Customers" value={stats?.totalCustomers ?? 0} icon="bi-people" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard label="Low stock items" value={stats?.lowStockCount ?? 0} icon="bi-exclamation-triangle" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard label="Wishlist adds" value={stats?.totalWishlistAdds ?? 0} icon="bi-heart" />
            </div>
            <div className="col-6 col-lg-3">
              <StatCard label="Shoppers with wishlists" value={stats?.usersWithWishlistItems ?? 0} icon="bi-person-heart" />
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card-suce p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Recent orders</h5>
                  <Link to="/admin/orders" style={{ fontSize: '0.82rem' }}>View all</Link>
                </div>
                {stats?.recentOrders?.length ? (
                  <div className="d-flex flex-column gap-3">
                    {stats.recentOrders.map((o) => (
                      <div key={o.id} className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="font-mono" style={{ fontSize: '0.82rem' }}>#{o.orderNumber ?? o.id}</span>
                          <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{o.customerName}</div>
                        </div>
                        <span className={`status-pill ${o.status?.toLowerCase()}`}>{o.status}</span>
                        <strong className="font-mono">{formatCurrency(o.totalAmount)}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary mb-0">No orders yet.</p>
                )}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card-suce p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Top products</h5>
                  <Link to="/admin/products" style={{ fontSize: '0.82rem' }}>Manage</Link>
                </div>
                {stats?.topProducts?.length ? (
                  <div className="d-flex flex-column gap-3">
                    {stats.topProducts.map((p) => (
                      <div key={p.id} className="d-flex justify-content-between align-items-center">
                        <span style={{ fontSize: '0.88rem' }}>{p.name}</span>
                        <span className="font-mono text-secondary" style={{ fontSize: '0.82rem' }}>{p.unitsSold} sold</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary mb-0">No sales data yet.</p>
                )}
              </div>
            </div>

            <div className="col-lg-3">
              <div className="card-suce p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Most wishlisted</h5>
                </div>
                {stats?.topWishlisted?.length ? (
                  <div className="d-flex flex-column gap-3">
                    {stats.topWishlisted.map((p, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center">
                        <span style={{ fontSize: '0.88rem' }}>{p.name}</span>
                        <span className="font-mono text-secondary" style={{ fontSize: '0.82rem' }}>{p.wishlistCount} <i className="bi bi-heart-fill" style={{ fontSize: '0.7rem' }}></i></span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary mb-0">No wishlist activity yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
