import { useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import Navbar from '../../components/Navbar'
import { useCart } from '../../context/CartContext'
import Link from 'next/link'

export default function CheckoutPage() {
  const { cartItems } = useCart()
  const router = useRouter()
  const [customerName, setCustomerName] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')

  const handleProceed = () => {
    if (!customerName || !customerId) {
      alert('Por favor ingresa nombre y cédula/RIF')
      return
    }
    const orderInfo = { customerName, customerId, address, phone, items: cartItems }
    localStorage.setItem('pendingOrder', JSON.stringify(orderInfo))
    router.push('/tienda/verificacion-pago')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Detalles de la Orden</h1>
        <div className="max-w-xl space-y-4 mb-6">
          <div>
            <label className="block mb-1">Nombre completo</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Cédula / RIF</label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Dirección</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Teléfono</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Productos</h2>
          <ul className="space-y-2">
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.nombre} x {item.quantity}
                </span>
                <span>Bs {(item.precio * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end space-x-4">
          <Link
            href="/tienda/cart"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Volver al carrito
          </Link>
          <button
            onClick={handleProceed}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
          >
            Realicé el pago
          </button>
        </div>
        </main>
      </div>
    </div>
  )
}