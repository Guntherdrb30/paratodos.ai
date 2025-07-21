import { useState, useEffect } from 'react'
import LayoutRoot from '../../../components/LayoutRoot'
import { db } from '../../../firebase/config'
import { useAuth } from '../../../context/AuthContext'
import { doc, getDoc, setDoc, collection, getDocs, updateDoc } from 'firebase/firestore'

export default function ConfiguracionPage() {
  const [rate, setRate] = useState('')
  const [loading, setLoading] = useState(true)
  const { role } = useAuth()
  const [whatsapp, setWhatsapp] = useState('')
  const tabs = [
    { key: 'rate', label: 'Tasa referencial BCV' },
    { key: 'comisionesWhatsapp', label: 'COMISIONES VENDEDORES Y NUMERO WHATSAPP' }
  ]
  const [activeTab, setActiveTab] = useState(tabs[0].key)

  // Comisiones por vendedor (solo root)
  const [vendors, setVendors] = useState([])
  const [rates, setRates] = useState({})
  const [search, setSearch] = useState('')
  const [loadingRates, setLoadingRates] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      const rateDoc = await getDoc(doc(db, 'settings', 'exchangeRate'))
      if (rateDoc.exists()) setRate(rateDoc.data().value)
      const waDoc = await getDoc(doc(db, 'settings', 'whatsappNumber'))
      if (waDoc.exists()) setWhatsapp(waDoc.data().value)
      setLoading(false)
    }
    fetchSettings()
  }, [])

  // Carga inicial de comisiones por vendedor
  useEffect(() => {
    if (role !== 'root') {
      setLoadingRates(false)
      return
    }
    const fetchVendors = async () => {
      const snap = await getDocs(collection(db, 'users'))
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.rol === 'vendedor')
      setVendors(list)
      const initial = list.reduce((acc, v) => ({ ...acc, [v.id]: v.comision ?? 0 }), {})
      setRates(initial)
      setLoadingRates(false)
    }
    fetchVendors()
  }, [role])

  const handleSave = async () => {
    const value = parseFloat(rate)
    if (isNaN(value) || value <= 0) return alert('Ingrese una tasa válida')
    await setDoc(doc(db, 'settings', 'exchangeRate'), { value })
    alert('Tasa referencial actualizada')
  }

  const handleSaveCommissions = async () => {
    try {
      await Promise.all(
        vendors.map(v =>
          updateDoc(doc(db, 'users', v.id), { comision: parseFloat(rates[v.id]) || 0 })
        )
      )
      alert('Porcentajes de comisión guardados')
    } catch (error) {
      console.error(error)
      alert('Error al guardar comisiones: ' + error.message)
    }
  }
  const handleSaveWhatsapp = async () => {
    if (!whatsapp.trim()) return alert('Ingrese un número de WhatsApp válido')
    await setDoc(doc(db, 'settings', 'whatsappNumber'), { value: whatsapp })
    alert('Número de WhatsApp guardado')
  }


  if (loading) return <p>Cargando...</p>

  return (
    <LayoutRoot>
      <h1 className="text-2xl font-bold mb-6">Configuración general</h1>

      {role === 'root' && (
        loadingRates ? (
          <p>Cargando comisiones por vendedor...</p>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Comisiones por vendedor</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Buscar vendedor (nombre o código)
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 border px-3 py-2 rounded"
                placeholder="Ingresa nombre o código..."
              />
            </div>
            <div className="overflow-x-auto shadow border-b border-gray-200 sm:rounded-lg mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % Comisión
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors
                    .filter((v) =>
                      v.nombre.toLowerCase().includes(search.toLowerCase()) ||
                      v.id.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((v) => (
                      <tr key={v.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{v.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{v.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.01"
                            value={rates[v.id] ?? 0}
                            onChange={(e) =>
                              setRates((prev) => ({ ...prev, [v.id]: e.target.value }))
                            }
                            className="w-20 border px-2 py-1 rounded"
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleSaveCommissions}
              className="px-4 py-2 bg-primary text-white rounded hover:opacity-75 mb-8"
            >
              Guardar comisiones por vendedor
            </button>
          </>
        )
      )}

      <div className="border-t border-gray-200 pt-6 mb-4">
        <label className="block text-gray-700 mb-2">Tasa referencial (Bs/USD)</label>
        <input
          type="number"
          step="0.01"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-32 border px-3 py-2 rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Número de WhatsApp</label>
        <input
          type="text"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-64 border px-3 py-2 rounded"
          placeholder="(+58) 412-1234567"
        />
      </div>
      <button
        onClick={handleSaveWhatsapp}
        className="px-4 py-2 bg-primary text-white rounded hover:opacity-75 mb-8"
      >
        Guardar número de WhatsApp
      </button>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-primary text-white rounded hover:opacity-75"
      >
        Guardar Tasa
      </button>
    </LayoutRoot>
  )
}