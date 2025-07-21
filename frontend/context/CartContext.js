import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart')
      if (stored) {
        setCartItems(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading cart from localStorage', error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    } catch (error) {
      console.error('Error saving cart to localStorage', error)
    }
  }, [cartItems])

  const addToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id)
      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, { ...product, quantity: 1 }]
      }
    })
  }

  const updateQuantity = (productId, quantity) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.precio || 0) * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  )
}