import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import Navbar from '../../components/Navbar'
import { useCart } from '../../context/CartContext'
import { db, storage } from '../../firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default function PaymentVerificationPage() {
  const [pendingOrder, setPendingOrder] = useState(null)
  const [payerName, setPayerName] = useState('')
  const [reference, setReference] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Transferencia')
  const [receipt, setReceipt] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const { clearCart } = useCart()

  useEffect(() => {
    const data = localStorage.getItem('pendingOrder')
    if (data) {
      setPendingOrder(JSON.parse(data))
    } else {
      router.replace('/tienda/cart')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pendingOrder) return
    if (!payerName || !reference || !amount) {
      alert('Por favor completa los campos requeridos')
      return
    }
    setSubmitting(true)
    try {
      let receiptUrl = ''
      if (receipt) {
        const storageRef = ref(
          storage,
          `receipts/${Date.now()}_${receipt.name}`
        )
        await uploadBytes(storageRef, receipt)
        receiptUrl = await getDownloadURL(storageRef)
      }
      const orderData = {
        ...pendingOrder,
        payment: {
          payerName,
          reference,
          amount: parseFloat(amount),
          method,
          receiptUrl,
        },
        status: 'Pendiente',
        createdAt: serverTimestamp(),
      }
      await addDoc(collection(db, 'orders'), orderData)
      clearCart()
      localStorage.removeItem('pendingOrder')
      alert('Orden enviada correctamente. ¡Gracias!')
      router.push('/')
    } catch (error) {
      console.error('Error al enviar orden:', error)
      alert('Ocurrió un error al enviar la orden')
    } finally {
      setSubmitting(false)
    }
  }

  if (!pendingOrder) return null

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Verificación de Pago</h1>
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <div>
            <label className="block mb-1">Nombre</label>
            <input
              type="text"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Número de referencia</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Monto Bs</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Método</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option>Transferencia</option>
              <option>Depósito</option>
              <option>Pago móvil</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Captura de pago</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReceipt(e.target.files[0])}
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/tienda/cart')}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={submitting}
            >
              Volver
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
              disabled={submitting}
            >
              {submitting ? 'Enviando...' : 'Enviar verificación'}
            </button>
          </div>
        </form>
        </main>
      </div>
    </div>
  )
}