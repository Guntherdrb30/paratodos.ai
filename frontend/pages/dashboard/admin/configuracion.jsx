import { useState, useEffect } from 'react'
import LayoutAdmin from '../../../components/LayoutAdmin'
import { db } from '../../../firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export default function ConfiguracionPage() {
  const [rate, setRate] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      const rateDoc = await getDoc(doc(db, 'settings', 'exchangeRate'))
      if (rateDoc.exists()) setRate(rateDoc.data().value)
      const waDoc = await getDoc(doc(db, 'settings', 'whatsappNumber'))
      if (waDoc.exists()) setWhatsappNumber(waDoc.data().value)
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    const value = parseFloat(rate)
    if (isNaN(value) || value <= 0) return alert('Ingrese una tasa válida')
    await setDoc(doc(db, 'settings', 'exchangeRate'), { value })
    alert('Tasa referencial actualizada')
  }

  const handleSaveWhatsapp = async () => {
    const value = whatsappNumber.trim()
    if (!value) return alert('Ingrese un número de WhatsApp válido')
    await setDoc(doc(db, 'settings', 'whatsappNumber'), { value })
    alert('Número de WhatsApp actualizado')
  }

  if (loading) return <p>Cargando...</p>

  return (
    <LayoutAdmin>
      <h1 className="text-2xl font-bold mb-6">Configuración general</h1>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Tasa referencial (Bs/USD)</label>
        <input
          type="number"
          step="0.01"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-32 border px-3 py-2 rounded"
        />
      </div>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-primary text-white rounded hover:opacity-75"
      >
        Guardar Tasa
      </button>

      <div className="mb-4 mt-6">
        <label className="block text-gray-700 mb-2">Número de WhatsApp</label>
        <input
          type="text"
          placeholder="+58412xxxxxxx"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          className="w-64 border px-3 py-2 rounded"
        />
      </div>
      <button
        onClick={handleSaveWhatsapp}
        className="px-4 py-2 bg-[#25D366] text-white rounded hover:bg-[#1ebe57]"
      >
        Guardar WhatsApp
      </button>
    </LayoutAdmin>
  )
}