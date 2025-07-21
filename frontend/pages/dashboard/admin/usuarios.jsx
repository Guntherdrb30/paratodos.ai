import { useState } from 'react'
import LayoutAdmin from '../../../components/LayoutAdmin'
import UserTable from '../../../components/UserTable'
import UserForm from '../../../components/UserForm'

export default function UsuariosPage() {
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const handleNewUser = () => {
    setSelectedUser(null)
    setShowModal(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <LayoutAdmin>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={handleNewUser}
          className="bg-primary hover:opacity-75 text-white px-4 py-2 rounded"
        >
          + Nuevo Usuario
        </button>
      </div>
      <UserTable onEdit={handleEditUser} />
      {showModal && <UserForm onClose={handleCloseModal} userToEdit={selectedUser} />}
    </LayoutAdmin>
  )
}