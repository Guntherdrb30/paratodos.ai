import { useState } from 'react'
import LayoutRoot from '../../../components/LayoutRoot'
import ProvidersModule from '../../../components/ProvidersModule'
import ProviderForm from '../../../components/ProviderForm'

export default function ProveedoresPage() {
  const [showModal, setShowModal] = useState(false)

  const handleNewProvider = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <LayoutRoot>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Control de Proveedores y Deudas</h1>
        <button
          onClick={handleNewProvider}
          className="bg-primary hover:opacity-75 text-white px-4 py-2 rounded"
        >
          + Nuevo Proveedor
        </button>
      </div>
      <ProvidersModule />
      {showModal && <ProviderForm onClose={handleCloseModal} />}
    </LayoutRoot>
  )
}