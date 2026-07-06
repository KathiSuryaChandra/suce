import { useEffect, useState } from 'react'
import categoryService from '../../services/categoryService'
import ConfirmModal from '../../components/ConfirmModal.jsx'
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function ManageCategories() {
  const toast = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    categoryService.list().then(setCategories).finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await categoryService.create({ name: name.trim() })
      setName('')
      toast.success('Category added')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add category')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(c) {
    setEditingId(c.id)
    setEditingName(c.name)
  }

  async function saveEdit(id) {
    try {
      await categoryService.update(id, { name: editingName.trim() })
      setEditingId(null)
      toast.success('Category updated')
      load()
    } catch {
      toast.error('Could not update category')
    }
  }

  async function handleDelete() {
    try {
      await categoryService.remove(deleteTarget.id)
      toast.success('Category deleted')
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete — it may still have products assigned')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <span className="eyebrow">Catalog</span>
      <h2 className="mt-1 mb-4">Categories</h2>

      <form onSubmit={handleCreate} className="d-flex gap-2 mb-4" style={{ maxWidth: 420 }}>
        <input
          className="form-control-suce"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn btn-suce-primary" disabled={saving}>Add</button>
      </form>

      {loading ? (
        <LoadingSkeleton rows={5} height={44} />
      ) : (
        <div className="card-suce" style={{ maxWidth: 560 }}>
          {categories.map((c, i) => (
            <div key={c.id} className="d-flex align-items-center justify-content-between px-4 py-3" style={{ borderTop: i > 0 ? '1px solid var(--suce-silver-light)' : 'none' }}>
              {editingId === c.id ? (
                <input
                  className="form-control-suce"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(c.id)}
                  autoFocus
                />
              ) : (
                <span>{c.name}</span>
              )}
              <div className="d-flex gap-1 ms-2">
                {editingId === c.id ? (
                  <button className="btn btn-suce-ghost" onClick={() => saveEdit(c.id)}><i className="bi bi-check-lg" /></button>
                ) : (
                  <button className="btn btn-suce-ghost" onClick={() => startEdit(c)}><i className="bi bi-pencil" /></button>
                )}
                <button className="btn btn-suce-ghost text-danger" onClick={() => setDeleteTarget(c)}><i className="bi bi-trash" /></button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <div className="text-center text-secondary py-4">No categories yet</div>}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this category?"
        message={`"${deleteTarget?.name}" will be removed. This only succeeds if no products are assigned to it.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
