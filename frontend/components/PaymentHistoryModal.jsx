import { useEffect, useState } from 'react'
import { db } from '../firebase/config'
import { getDocs, collection, query, where, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

export default function PaymentHistoryModal({ invoiceId, onClose }) {
  const { role } = useAuth()
  const roleLc = role?.toLowerCase() || ''
  const isEditor = roleLc === 'root' || roleLc === 'admin'
  const [payments, setPayments] = useState([])
  const [newPayment, setNewPayment] = useState({ fecha: '', monto: '', metodo: '', adjunto: '' })

  useEffect(() => {
    const fetchPayments = async () => {
      const snap = await getDocs(query(collection(db, 'payments'), where('invoiceId', '==', invoiceId)))
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    }
    fetchPayments()
  }, [invoiceId])

  const handleAdd = async () => {
    const data = {
      invoiceId,
      fecha: new Date(newPayment.fecha),
      monto: parseFloat(newPayment.monto) || 0,
      metodo: newPayment.metodo,
      adjunto: newPayment.adjunto,
      createdBy: role,
      createdAt: new Date()
    }
    const docRef = await addDoc(collection(db, 'payments'), data)
    setPayments((prev) => [...prev, { id: docRef.id, ...data }])
    const invRef = doc(db, 'invoices', invoiceId)
    const invSnap = await getDoc(invRef)
    const inv = invSnap.data() || {}
    const paid = (inv.paidAmount || 0) + data.monto
    const status = paid >= inv.total ? 'Pagada' : 'Parcial'
    await updateDoc(invRef, { paidAmount: paid, estado: status, updatedBy: role, updatedAt: new Date() })
    setNewPayment({ fecha: '', monto: '', metodo: '', adjunto: '' })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Historial de Pagos</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Cerrar</button>
        </div>
        {isEditor && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="date"
              value={newPayment.fecha}
              onChange={(e) => setNewPayment((s) => ({ ...s, fecha: e.target.value }))}
              className="border p-2 rounded"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Monto"
              value={newPayment.monto}
              onChange={(e) => setNewPayment((s) => ({ ...s, monto: e.target.value }))}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Método"
              value={newPayment.metodo}
              onChange={(e) => setNewPayment((s) => ({ ...s, metodo: e.target.value }))}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Adjunto URL"
              value={newPayment.adjunto}
              onChange={(e) => setNewPayment((s) => ({ ...s, adjunto: e.target.value }))}
              className="border p-2 rounded"
            />
            <button
              onClick={handleAdd}
              className="col-span-4 px-4 py-2 bg-primary text-white rounded"
            >
              Registrar Pago
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adjunto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 whitespace-nowrap">{p.fecha.toDate().toLocaleDateString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{p.monto.toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{p.metodo}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {p.adjunto && (
                      <a href={p.adjunto} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Ver
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}