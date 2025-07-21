import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore'

export default function UserTable({ onEdit }) {
  const { role: authRole } = useAuth()
  const [users, setUsers] = useState([])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsub()
  }, [])

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      await deleteDoc(doc(db, 'users', id))
    }
  }

  const roles = ['admin', 'vendedor', 'despacho', 'ecommerce']

  return (
    <>
      {roles.map((roleCat) => {
        const usersOfRole = users.filter((u) => u.rol === roleCat)
        if (usersOfRole.length === 0) return null
        return (
          <div key={roleCat} className="mb-8">
            <h2 className="text-xl font-semibold px-6 py-3 capitalize">{roleCat}</h2>
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    {authRole === 'root' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % Comisión
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersOfRole.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.rol}</td>
                      {authRole === 'root' && (
                        <td className="px-6 py-4 whitespace-nowrap">{user.comision ?? 0}%</td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => onEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </>
  )
}