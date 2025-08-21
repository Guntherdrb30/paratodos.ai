import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { devError } from '../utils/devLog'

export default function UserForm({ onClose, userToEdit }) {
  const { role: authRole } = useAuth()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [rol, setRol] = useState('admin')
  const [comision, setComision] = useState(0)

  useEffect(() => {
    if (userToEdit) {
      setNombre(userToEdit.nombre || '')
      setEmail(userToEdit.email || '')
      setRol(userToEdit.rol || 'admin')
      setComision(userToEdit.comision ?? 0)
    } else {
      setNombre('')
      setEmail('')
      setRol('admin')
      setComision(0)
    }
  }, [userToEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const userData = { nombre, email, rol }
    if (authRole === 'root') {
      userData.comision = parseFloat(comision) || 0
    }
    try {
      if (userToEdit) {
        await updateDoc(doc(db, 'users', userToEdit.id), userData)
      } else {
        await addDoc(collection(db, 'users'), userData)
      }
      alert('Usuario guardado correctamente')
      onClose()
    } catch (error) {
      devError('Error guardando usuario:', error)
      alert('Error al guardar el usuario: ' + error.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>
        <form onSubmit={handleSubmit}>
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
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Rol</label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          >
            <option value="admin">admin</option>
            <option value="vendedor">vendedor</option>
            <option value="despacho">despacho</option>
            <option value="ecommerce">ecommerce</option>
          </select>
        </div>
        {authRole === 'root' && rol === 'vendedor' && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">% Comisión</label>
            <input
              type="number"
              step="0.01"
              value={comision}
              onChange={(e) => setComision(e.target.value)}
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