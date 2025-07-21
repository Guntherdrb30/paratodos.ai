import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'

export default function InventoryForm({ onClose, itemToEdit }) {
  const [producto, setProducto] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [ubicacion, setUbicacion] = useState('')

  useEffect(() => {
    if (itemToEdit) {
      setProducto(itemToEdit.producto || '')
      setCantidad(itemToEdit.cantidad || '')
      setUbicacion(itemToEdit.ubicacion || '')
    } else {
      setProducto('')
      setCantidad('')
      setUbicacion('')
    }
  }, [itemToEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { producto, cantidad, ubicacion }
    if (itemToEdit) {
      await updateDoc(doc(db, 'inventory', itemToEdit.id), data)
    } else {
      await addDoc(collection(db, 'inventory'), data)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {itemToEdit ? 'Editar Inventario' : 'Nuevo Inventario'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Producto</label>
            <input
              type="text"
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Cantidad</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Ubicación</label>
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:opacity-75"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}