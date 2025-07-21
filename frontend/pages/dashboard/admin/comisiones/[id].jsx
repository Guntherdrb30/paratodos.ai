import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../../../context/AuthContext'
import { db } from '../../../../firebase/config'
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { FaEye } from 'react-icons/fa'
import LayoutAdmin from '../../../../components/LayoutAdmin'

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function ComisionDetailPage() {
  const router = useRouter()
  const { id, month: qMonth, year: qYear } = router.query
  const { role } = useAuth()
  const [vendor, setVendor] = useState(null)
  const [sales, setSales] = useState([])
  const [filterMonth, setFilterMonth] = useState(Number(qMonth) || new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(Number(qYear) || new Date().getFullYear())
  const [rate, setRate] = useState(0)
  const [totalCommission, setTotalCommission] = useState(0)

  useEffect(() => {
    if (!id) return
    const fetchVendor = async () => {
      const docSnap = await getDoc(doc(db, 'users', id))
      if (docSnap.exists()) {
        setVendor({ id: docSnap.id, ...docSnap.data() })
        setRate(docSnap.data().comision ?? 0)
      }
    }
    fetchVendor()
  }, [id])

  useEffect(() => {
    if (!id) return
    const unsub = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const list = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (s) =>
            s.sellerId === id &&
            s.createdAt?.toDate().getMonth() + 1 === filterMonth &&
            s.createdAt?.toDate().getFullYear() === filterYear
        )
      setSales(list)
      const total = list.reduce(
        (sum, s) => sum + (s.totalBs || 0) * (rate / 100),
        0
      )
      setTotalCommission(total)
    })
    return () => unsub()
  }, [id, filterMonth, filterYear, rate])

  if (!vendor) {
    return (
      <LayoutAdmin>
        <p>Cargando...</p>
      </LayoutAdmin>
    )
  }

  return (
    <LayoutAdmin>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          Comisiones de {vendor.nombre} ({vendor.id})
        </h1>
        <button
          onClick={() =>
            router.push(
              `/dashboard/admin/comisiones?month=${filterMonth}&year=${filterYear}`
            )
          }
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Volver
        </button>
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(Number(e.target.value))}
          className="border px-3 py-2 rounded"
        >
          {monthNames.map((m, i) => (
            <option key={i + 1} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(Number(e.target.value))}
          className="border px-3 py-2 rounded"
        >
          {[...new Set(
            sales.map((s) => s.createdAt?.toDate().getFullYear())
          )]
            .sort((a, b) => b - a)
            .map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
        </select>
      </div>
      {sales.length === 0 ? (
        <p>No hay ventas en este periodo.</p>
      ) : (
        <div className="overflow-x-auto shadow border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Bs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisión Bs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((s) => {
                const commission = (s.totalBs || 0) * (rate / 100)
                return (
                  <tr key={s.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {s.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {s.createdAt?.toDate().toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {s.totalBs.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {commission.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/admin/ventas/${s.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FaEye />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 text-right font-bold">
        Total comisiones Bs: {totalCommission.toFixed(2)}
      </div>
    </LayoutAdmin>
  )
}