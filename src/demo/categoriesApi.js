import { store, nextId } from './storage'
import { wait, demoError } from './utils'

const categoriesApi = {
  async list() {
    await wait(150)
    return store.getCategories()
  },

  async create(payload) {
    await wait()
    const list = store.getCategories()
    const category = { id: nextId(list), name: payload.name }
    store.setCategories([...list, category])
    return category
  },

  async update(id, payload) {
    await wait()
    const updated = store.getCategories().map((c) =>
      c.id === Number(id) ? { ...c, name: payload.name } : c,
    )
    store.setCategories(updated)
    return updated.find((c) => c.id === Number(id))
  },

  async remove(id) {
    await wait()
    const inUse = store.getProducts().some((p) => p.category?.id === Number(id))
    if (inUse) {
      throw demoError('This category still has products assigned to it.')
    }
    store.setCategories(store.getCategories().filter((c) => c.id !== Number(id)))
    return { success: true }
  },
}

export default categoriesApi
