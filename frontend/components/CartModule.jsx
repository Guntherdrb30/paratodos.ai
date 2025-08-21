import Link from 'next/link'
import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { useCart } from '../context/CartContext'
import { devError } from '../utils/devLog'

export default function CartModule() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart()
  const [rate, setRate] = useState(null)
  const [loadingRate, setLoadingRate] = useState(true)
  const [errorRate, setErrorRate] = useState(null)

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const rateDoc = await getDoc(doc(db, 'settings', 'exchangeRate'))
        if (rateDoc.exists()) {
          setRate(rateDoc.data().value)
        } else {
          setErrorRate(new Error('No se encontró la tasa de cambio'))
        }
      } catch (err) {
        devError('Error cargando tasa de cambio:', err)
        setErrorRate(err)
      } finally {
        setLoadingRate(false)
      }
    }
    fetchRate()
  }, [])

  if (loadingRate) return <p>Cargando tasa de cambio...</p>
  if (errorRate) return <p className="text-red-500">Error al cargar tasa de cambio: {errorRate.message}</p>
  if (cartItems.length === 0) {
    return <p>Tu carrito está vacío.</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Carrito de Compras</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase">Precio Bs</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase">Cantidad</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase">Subtotal Bs</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cartItems.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-2 whitespace-nowrap flex items-center space-x-2">
                  {item.imagenes && item.imagenes[0] ? (
                    <img
                      src={item.imagenes[0]}
                      alt={item.nombre}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 flex items-center justify-center text-gray-500">
                      Sin imagen
                    </div>
                  )}
                  <span>{item.nombre}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  Bs {(Number(item.precio) * rate).toFixed(2)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                    className="w-16 border px-2 py-1 rounded"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  Bs {(Number(item.precio) * item.quantity * rate).toFixed(2)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end items-center space-x-4 mb-4">
        <span className="text-lg font-semibold">Total:</span>
        <span className="text-xl font-bold">Bs {(totalPrice * rate).toFixed(2)}</span>
      </div>
      <div className="flex justify-end">
        <Link
          href="/tienda/checkout"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
        >
          Finalizar compra
        </Link>
      </div>
    </div>
  )
}