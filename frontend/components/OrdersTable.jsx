import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore'
import { devError } from '../utils/devLog'

const STATUSES = [
  'Pendiente',
  'Revisada',
  'Aprobada',
  'En preparación',
  'Enviada',
  'Entregada'
]

export default function OrdersTable() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const data = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) =>
          a.createdAt?.toDate() < b.createdAt?.toDate() ? 1 : -1
        )
      setOrders(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handleStatusChange = async (orderId, currentStatus, newStatus, items) => {
    try {
      if (currentStatus !== 'Aprobada' && newStatus === 'Aprobada') {
        for (const item of items) {
          const productRef = doc(db, 'products', item.id)
          const productSnap = await getDoc(productRef)
          if (productSnap.exists()) {
            const prodData = productSnap.data()
            const currentStock = prodData.stock ?? 0
            await updateDoc(productRef, {
              stock: currentStock - (item.quantity || 0)
            })
          }
        }
      }
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus })
    } catch (error) {
      devError('Error actualizando estado de orden:', error)
      alert('Error actualizando estado: ' + error.message)
    }
  }

  if (loading) {
    return <p>Cargando pedidos...</p>
  }

  return (
    <div className="overflow-x-auto bg-white shadow sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{order.client?.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{order.createdAt?.toDate().toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={order.status || 'Pendiente'}
                  onChange={(e) =>
                    handleStatusChange(order.id, order.status, e.target.value, order.items || [])
                  }
                  className="border-gray-300 rounded"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}