import { useEffect, useState } from 'react'
import { db } from '../firebase/config'
import { getDocs, collection, query, where, updateDoc, doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { FaExclamationTriangle, FaPlus } from 'react-icons/fa'
import PaymentHistoryModal from './PaymentHistoryModal'

export default function ProviderDetailModal({ provider, onClose }) {
  const { role } = useAuth()
  const roleLc = role?.toLowerCase() || ''
  const isEditor = roleLc === 'root' || roleLc === 'admin'
  const [orders, setOrders] = useState([])
  const [invoices, setInvoices] = useState([])
  const [contacts, setContacts] = useState(provider.contacts || [])
  const [newContact, setNewContact] = useState({ nombre: '', cargo: '', telefono: '', email: '' })
  const [paymentsInv, setPaymentsInv] = useState(null)

  useEffect(() => {
    if (!provider) return
    const fetchRelations = async () => {
      const ordersSnap = await getDocs(
        query(collection(db, 'orders'), where('providerId', '==', provider.id))
      )
      setOrders(ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      const invSnap = await getDocs(
        query(collection(db, 'invoices'), where('providerId', '==', provider.id))
      )
      setInvoices(invSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
    }
    fetchRelations()
  }, [provider])

  const addContact = async () => {
    const updated = [...contacts, newContact]
    await updateDoc(doc(db, 'providers', provider.id), { contacts: updated })
    setContacts(updated)
    setNewContact({ nombre: '', cargo: '', telefono: '', email: '' })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{provider.nombre} - Detalle</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Cerrar</button>
        </div>
        <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><strong>Código:</strong> {provider.codigo}</div>
          <div><strong>RIF:</strong> {provider.rif}</div>
          <div><strong>Dirección:</strong> {provider.direccion}</div>
          <div><strong>Teléfono:</strong> {provider.telefono}</div>
          <div className="sm:col-span-2"><strong>Descripción:</strong> {provider.descripcion}</div>
          {isEditor && (
            <div className="sm:col-span-2">
              <strong>Notas internas:</strong>
              <textarea
                value={provider.notasInternas || ''}
                onChange={(e) =>
                  updateDoc(doc(db, 'providers', provider.id), { notasInternas: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          )}
        </section>
        {paymentsInv && (
          <PaymentHistoryModal
            invoiceId={paymentsInv}
            onClose={() => setPaymentsInv(null)}
          />
        )}
        <section className="mb-6">
          <h3 className="font-semibold mb-2">Contactos</h3>
          <div className="overflow-x-auto mb-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((c, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{c.nombre}</td>
                    <td className="px-4 py-2">{c.cargo}</td>
                    <td className="px-4 py-2">{c.telefono}</td>
                    <td className="px-4 py-2">{c.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isEditor && (
            <div className="flex space-x-2 mb-4">
              <input
                placeholder="Nombre"
                value={newContact.nombre}
                onChange={(e) => setNewContact((s) => ({ ...s, nombre: e.target.value }))}
                className="border border-gray-300 px-2 py-1 rounded flex-1"
              />
              <input
                placeholder="Cargo"
                value={newContact.cargo}
                onChange={(e) => setNewContact((s) => ({ ...s, cargo: e.target.value }))}
                className="border border-gray-300 px-2 py-1 rounded flex-1"
              />
              <input
                placeholder="Teléfono"
                value={newContact.telefono}
                onChange={(e) => setNewContact((s) => ({ ...s, telefono: e.target.value }))}
                className="border border-gray-300 px-2 py-1 rounded flex-1"
              />
              <input
                placeholder="Email"
                value={newContact.email}
                onChange={(e) => setNewContact((s) => ({ ...s, email: e.target.value }))}
                className="border border-gray-300 px-2 py-1 rounded flex-1"
              />
              <button
                onClick={addContact}
                className="px-3 py-1 bg-primary text-white rounded"
              >
                <FaPlus />
              </button>
            </div>
          )}
        </section>
        <section className="mb-6">
          <h3 className="font-semibold mb-2">Órdenes de Compra</h3>
          <div className="overflow-x-auto shadow border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha emisión</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-2 whitespace-nowrap">{o.codigo}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{o.fechaEmision?.toDate().toLocaleDateString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{o.total?.toFixed(2)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{o.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="mb-6">
          <h3 className="font-semibold mb-2">Facturas</h3>
          <div className="overflow-x-auto shadow border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código factura</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pagado</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Emisión</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adjunto</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pagos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((inv) => {
                  const due = inv.fechaVencimiento?.toDate()
                  const daysOver = due ? Math.floor((new Date() - due) / (1000 * 60 * 60 * 24)) : 0
                  const overdue = daysOver > 20 || (due && daysOver > 0)
                  return (
                    <tr key={inv.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{inv.codigo}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{inv.total?.toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{inv.paidAmount?.toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{(inv.total - (inv.paidAmount || 0)).toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{inv.fechaEmision?.toDate().toLocaleDateString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {overdue && <FaExclamationTriangle className="inline text-red-500 mr-1" />}
                        {inv.estado}
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap ${overdue ? 'text-red-600' : ''}`}>{inv.fechaVencimiento?.toDate().toLocaleDateString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {inv.adjunto && (
                          <a href={inv.adjunto} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ver</a>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <button
                          onClick={() => setPaymentsInv(inv.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Ver pagos
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}