import { useState, useEffect } from 'react'
import LayoutRoot from '../../../../components/LayoutRoot'
import { useAuth } from '../../../../context/AuthContext'
import { db } from '../../../../firebase/config'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { devError } from '../../../../utils/devLog'

export default function CommissionConfigPage() {
  const { role } = useAuth()
  const [vendors, setVendors] = useState([])
  const [rates, setRates] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (role !== 'root') return
    const fetchVendors = async () => {
      const snap = await getDocs(collection(db, 'users'))
      const list = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.rol === 'vendedor')
      setVendors(list)
      const initial = list.reduce((acc, v) => ({ ...acc, [v.id]: v.comision ?? 0 }), {})
      setRates(initial)
      setLoading(false)
    }
    fetchVendors()
  }, [role])

  const handleChange = (id, value) => {
    setRates((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    try {
      await Promise.all(
        vendors.map((v) =>
          updateDoc(doc(db, 'users', v.id), { comision: parseFloat(rates[v.id]) || 0 })
        )
      )
      alert('Porcentajes de comisión guardados')
    } catch (error) {
      devError(error)
      alert('Error al guardar configuración: ' + error.message)
    }
  }

  if (role !== 'root') {
    return (
      <LayoutRoot>
        <p>Acceso denegado</p>
      </LayoutRoot>
    )
  }

  if (loading) {
    return (
      <LayoutRoot>
        <p>Cargando...</p>
      </LayoutRoot>
    )
  }

  return (
    <LayoutRoot>
      <h1 className="text-2xl font-bold mb-6">Configuración de comisiones</h1>
      <div className="overflow-x-auto shadow border-b border-gray-200 sm:rounded-lg mb-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Comisión</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vendors.map((v) => (
              <tr key={v.id}>
                <td className="px-6 py-4 whitespace-nowrap">{v.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{v.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={rates[v.id]}
                    onChange={(e) => handleChange(v.id, e.target.value)}
                    className="w-20 border px-2 py-1 rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-primary text-white rounded hover:opacity-75"
      >
        Guardar configuración
      </button>
    </LayoutRoot>
  )
}