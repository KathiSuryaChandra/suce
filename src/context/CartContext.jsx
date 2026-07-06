import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import cartService from '../services/cartService'
import { useAuth } from '../hooks/useAuth'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const cart = await cartService.get()
      setItems(cart.items || [])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback(
    async (product, quantity = 1) => {
      const previous = items
      // Optimistic placeholder so the badge/UI updates instantly.
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id)
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
          )
        }
        return [...prev, { id: `temp-${product.id}`, product, quantity }]
      })
      try {
        const cart = await cartService.addItem(product.id, quantity)
        setItems(cart.items || [])
      } catch (err) {
        setItems(previous)
        throw err
      }
    },
    [items],
  )

  const updateItem = useCallback(
    async (itemId, quantity) => {
      const previous = items
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)))
      try {
        const cart = await cartService.updateItem(itemId, quantity)
        setItems(cart.items || [])
      } catch (err) {
        setItems(previous)
        throw err
      }
    },
    [items],
  )

  const removeItem = useCallback(
    async (itemId) => {
      const previous = items
      setItems((prev) => prev.filter((i) => i.id !== itemId))
      try {
        await cartService.removeItem(itemId)
      } catch (err) {
        setItems(previous)
        throw err
      }
    },
    [items],
  )

  const clear = useCallback(async () => {
    const previous = items
    setItems([])
    try {
      await cartService.clear()
    } catch (err) {
      setItems(previous)
      throw err
    }
  }, [items])

  const { totalItems, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc.totalItems += i.quantity
        acc.subtotal += i.quantity * (i.product?.discountPrice ?? i.product?.price ?? 0)
        return acc
      },
      { totalItems: 0, subtotal: 0 },
    )
  }, [items])

  const value = {
    items,
    loading,
    totalItems,
    subtotal,
    addItem,
    updateItem,
    removeItem,
    clear,
    refresh,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
