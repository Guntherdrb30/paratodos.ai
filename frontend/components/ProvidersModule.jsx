import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import { FaFileExcel, FaFilePdf } from 'react-icons/fa'
import * as XLSX from 'xlsx'
import ProviderDetailModal from './ProviderDetailModal'

export default function ProvidersModule() {
  const { role, loading: authLoading } = useAuth()
  const roleLc = role?.toLowerCase() || ''
  const isAdmin = roleLc === 'root' || roleLc === 'admin'
  const [providers, setProviders] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProv, setSelectedProv] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAdmin) {
      setLoading(false)
      return
    }
    const fetchData = async () => {
      setLoading(true)
      try {
        const [provSnap, invSnap] = await Promise.all([
          getDocs(collection(db, 'providers')),
          getDocs(collection(db, 'invoices'))
        ])
        setProviders(provSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setInvoices(invSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error('Error fetching providers:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [authLoading, isAdmin])

  const totalProviders = providers.length
  const totalDebt = invoices.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0)
  const debtByProvider = invoices.reduce((acc, inv) => {
    acc[inv.providerId] = (acc[inv.providerId] || 0) + (inv.balanceAmount || 0)
    return acc
  }, {})
  const topProviderId = Object.keys(debtByProvider).sort((a, b) => debtByProvider[b] - debtByProvider[a])[0]
  const topProviderName = providers.find((p) => p.id === topProviderId)?.nombre || '-'
  const expiring = invoices.filter((inv) => {
    const due = inv.fechaVencimiento?.toDate()
    if (!due) return false
    const diff = (due - new Date()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  }).length

  const filteredProviders = useMemo(() => {
    return providers.filter(
      (p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(search.toLowerCase()) ||
        p.rif?.toLowerCase().includes(search.toLowerCase())
    )
  }, [providers, search])

  const exportExcel = () => {
    const header = ['Código', 'Nombre', 'RIF', 'Deuda']
    const data = filteredProviders.map((p) => [
      p.codigo,
      p.nombre,
      p.rif,
      debtByProvider[p.id] ?? 0
    ])
    const ws = XLSX.utils.aoa_to_sheet([header, ...data])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores')
    XLSX.writeFile(wb, 'proveedores.xlsx')
  }

  const exportPdf = async () => {
    const header = ['Código', 'Nombre', 'RIF', 'Deuda']
    const body = [header, ...filteredProviders.map((p) => [
      p.codigo,
      p.nombre,
      p.rif,
      debtByProvider[p.id] ?? 0
    ])]
    const { pdfMake } = await import('pdfmake/build/pdfmake')
    const docDefinition = {
      content: [
        { text: 'Resumen Proveedores', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: Array(header.length).fill('*'),
            body
          }
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
      }
    }
    pdfMake.createPdf(docDefinition).open()
  }

  if (authLoading) return <p>Cargando usuario...</p>
  if (!isAdmin) return <p className="text-red-500">Acceso denegado</p>
  if (loading) return <p>Cargando proveedores...</p>
  if (error) return <p className="text-red-500">Error al cargar datos: {error.message}</p>

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Proveedores</p>
          <p className="text-2xl font-bold">{totalProviders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Adeudado</p>
          <p className="text-2xl font-bold">{totalDebt.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Proveedor Mayor Deuda</p>
          <p className="text-2xl font-bold">{topProviderName}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Facturas a Vencer (7d)</p>
          <p className="text-2xl font-bold">{expiring}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Buscar por código, nombre o RIF"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded w-1/3"
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={exportExcel}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded"
          >
            <FaFileExcel />
            <span>Excel</span>
          </button>
          <button
            onClick={exportPdf}
            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded"
          >
            <FaFilePdf />
            <span>PDF</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RIF</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adeuda</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProviders.map((p) => {
              const overdue = invoices
                .filter((inv) => inv.providerId === p.id && inv.balanceAmount > 0)
                .some((inv) => {
                  const due = inv.fechaVencimiento?.toDate()
                  return due && (new Date() - due) / (1000 * 60 * 60 * 24) > 20
                })
              return (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{p.codigo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.rif}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${overdue ? 'text-red-600 font-semibold' : ''}`}>{debtByProvider[p.id]?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedProv(p)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {selectedProv && (
        <ProviderDetailModal
          provider={selectedProv}
          onClose={() => setSelectedProv(null)}
        />
      )}
    </>
  )
}