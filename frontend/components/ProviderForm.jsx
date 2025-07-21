import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'

export default function ProviderForm({ onClose, providerToEdit }) {
  const { role } = useAuth()
  const roleLc = role?.toLowerCase() || ''
  const isEditor = roleLc === 'root' || roleLc === 'admin'

  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [rif, setRif] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [notasInternas, setNotasInternas] = useState('')

  useEffect(() => {
    if (providerToEdit) {
      setCodigo(providerToEdit.codigo || '')
      setNombre(providerToEdit.nombre || '')
      setRif(providerToEdit.rif || '')
      setDireccion(providerToEdit.direccion || '')
      setTelefono(providerToEdit.telefono || '')
      setDescripcion(providerToEdit.descripcion || '')
      setNotasInternas(providerToEdit.notasInternas || '')
    } else {
      setCodigo('')
      setNombre('')
      setRif('')
      setDireccion('')
      setTelefono('')
      setDescripcion('')
      setNotasInternas('')
    }
  }, [providerToEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { codigo, nombre, rif, direccion, telefono, descripcion }
    if (isEditor) {
      data.notasInternas = notasInternas
    }
    try {
      if (providerToEdit) {
        await updateDoc(doc(db, 'providers', providerToEdit.id), data)
      } else {
        await addDoc(collection(db, 'providers'), data)
      }
      alert('Proveedor guardado correctamente')
      onClose()
    } catch (error) {
      console.error('Error guardando proveedor:', error)
      alert('Error al guardar el proveedor: ' + error.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {providerToEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Código</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">RIF</label>
            <input
              type="text"
              value={rif}
              onChange={(e) => setRif(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Dirección</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Descripción</label>
            <textarea
              rows="3"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
          </div>
          {isEditor && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Notas internas</label>
              <textarea
                rows="3"
                value={notasInternas}
                onChange={(e) => setNotasInternas(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded"
              />
            </div>
          )}
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