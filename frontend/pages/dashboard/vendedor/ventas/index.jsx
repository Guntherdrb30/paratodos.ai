import { useState } from 'react'
import LayoutVendedor from '../../../../components/LayoutVendedor'
import SalesTable from '../../../../components/SalesTable'
import SalesForm from '../../../../components/SalesForm'

export default function VentasPage() {
  const [showModal, setShowModal] = useState(false)

  const handleNewSale = () => setShowModal(true)

  const handleCloseModal = () => setShowModal(false)

  return (
    <LayoutVendedor>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Ventas</h1>
        <button
          onClick={handleNewSale}
          className="bg-primary hover:opacity-75 text-white px-4 py-2 rounded"
        >
          + Nueva Venta
        </button>
      </div>
      <SalesTable />
      {showModal && <SalesForm onClose={handleCloseModal} />}
    </LayoutVendedor>
  )
}