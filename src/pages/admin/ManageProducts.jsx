import { useEffect, useState } from 'react'
import productService from '../../services/productService'
import categoryService from '../../services/categoryService'
import { formatCurrency } from '../../components/PriceTag.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { resolveImageUrl } from '../../utils/imageUrl'

const EMPTY_FORM = {
  id: null,
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  stockQuantity: '',
  sku: '',
  categoryId: '',
}

export default function ManageProducts() {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Images for whichever product is currently open in the form. Empty
  // until the product has been saved at least once, since the upload
  // endpoint needs a real product id to attach images to.
  const [formImages, setFormImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)

  function loadProducts() {
    setLoading(true)
    productService
      .list({ search: search || undefined, size: 100 })
      .then((res) => setProducts(res.content ?? res))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
    categoryService.list().then(setCategories)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handle = setTimeout(loadProducts, 350)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormImages([])
    setFormOpen(true)
  }

  function openEdit(p) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      discountPrice: p.discountPrice ?? '',
      stockQuantity: p.stockQuantity,
      sku: p.sku ?? '',
      categoryId: p.category?.id ?? '',
    })
    setFormImages(p.images ?? [])
    setFormOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discountPrice: form.discountPrice === '' ? null : Number(form.discountPrice),
      stockQuantity: Number(form.stockQuantity),
      sku: form.sku,
      categoryId: Number(form.categoryId),
    }
    try {
      if (form.id) {
        const updated = await productService.update(form.id, payload)
        toast.success('Product updated')
        setFormImages(updated.images ?? [])
      } else {
        const created = await productService.create(payload)
        toast.success('Product created — now add some photos')
        // Switch into edit mode for the product we just created, instead
        // of closing the form, so the image uploader (which needs a real
        // product id) becomes available immediately.
        setForm((f) => ({ ...f, id: created.id }))
        setFormImages(created.images ?? [])
      }
      loadProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save product')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length || !form.id) return
    setUploadingImages(true)
    try {
      const formData = new FormData()
      files.forEach((f) => formData.append('files', f))
      const updated = await productService.uploadImages(form.id, formData)
      setFormImages(updated.images ?? [])
      toast.success('Image(s) uploaded')
      loadProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not upload image(s)')
    } finally {
      setUploadingImages(false)
      e.target.value = ''
    }
  }

  async function handleDelete() {
    try {
      await productService.remove(deleteTarget.id)
      toast.success('Product deleted')
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    } catch {
      toast.error('Could not delete product')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <span className="eyebrow">Catalog</span>
          <h2 className="mt-1 mb-0">Products</h2>
        </div>
        <button className="btn btn-suce-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1" /> Add product
        </button>
      </div>

      <input
        className="form-control-suce mb-4"
        style={{ maxWidth: 320 }}
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {formOpen && (
        <form onSubmit={handleSubmit} className="card-suce p-4 mb-4">
          <h5 className="mb-3">{form.id ? 'Edit product' : 'New product'}</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label-suce">Name</label>
              <input className="form-control-suce" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label-suce">Category</label>
              <select className="form-select-suce" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label-suce">Description</label>
              <textarea className="form-control-suce" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label-suce">Price</label>
              <input type="number" min="0" step="0.01" className="form-control-suce" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label-suce">Discount price</label>
              <input type="number" min="0" step="0.01" className="form-control-suce" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label-suce">Stock qty</label>
              <input type="number" min="0" className="form-control-suce" required value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label-suce">SKU</label>
              <input className="form-control-suce" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
          </div>

          <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--suce-silver-light)' }}>
            <label className="form-label-suce">Product photos</label>
            {!form.id ? (
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                Save the product first, then come back here to add photos.
              </p>
            ) : (
              <>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  {formImages.map((img) => (
                    <div
                      key={img.id}
                      style={{ width: 80, height: 80, borderRadius: 4, overflow: 'hidden', position: 'relative' }}
                      className="border"
                    >
                      <img
                        src={resolveImageUrl(img.url)}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {img.isPrimary && (
                        <span
                          className="status-pill"
                          style={{ position: 'absolute', bottom: 2, left: 2, fontSize: '0.6rem', padding: '1px 5px' }}
                        >
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                  {formImages.length === 0 && (
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>No photos yet.</p>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="form-control-suce"
                  disabled={uploadingImages}
                  onChange={handleImageUpload}
                />
                {uploadingImages && (
                  <p className="text-secondary mt-2 mb-0" style={{ fontSize: '0.8rem' }}>Uploading…</p>
                )}
              </>
            )}
          </div>
          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-suce-primary" disabled={saving}>
              {saving ? 'Saving…' : form.id ? 'Save changes' : 'Create product'}
            </button>
            <button type="button" className="btn btn-suce-outline" onClick={() => setFormOpen(false)}>
              {form.id ? 'Done' : 'Cancel'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSkeleton rows={6} height={48} />
      ) : (
        <div className="card-suce" style={{ overflowX: 'auto' }}>
          <table className="table mb-0">
            <thead>
              <tr style={{ fontSize: '0.78rem' }} className="text-secondary">
                <th className="px-3 py-3" style={{ width: 56 }}></th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="text-end px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2">
                    <div style={{ width: 40, height: 40, borderRadius: 4, overflow: 'hidden', background: 'var(--suce-silver-light)' }} className="d-flex align-items-center justify-content-center">
                      {p.images?.[0]?.url ? (
                        <img src={resolveImageUrl(p.images[0].url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className="bi bi-image text-secondary" style={{ fontSize: '0.9rem' }} />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">{p.name}</td>
                  <td>{p.category?.name}</td>
                  <td className="font-mono">{formatCurrency(p.discountPrice ?? p.price)}</td>
                  <td>
                    <span className={`status-pill ${p.stockQuantity > 0 ? 'delivered' : 'cancelled'}`}>
                      {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="text-end px-3">
                    <button className="btn btn-suce-ghost" onClick={() => openEdit(p)}><i className="bi bi-pencil" /></button>
                    <button className="btn btn-suce-ghost text-danger" onClick={() => setDeleteTarget(p)}><i className="bi bi-trash" /></button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="text-center text-secondary py-4">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this product?"
        message={`"${deleteTarget?.name}" will be removed from the catalog (marked inactive — order history is preserved).`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
