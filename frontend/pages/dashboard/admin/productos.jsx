import { useState } from 'react'
import LayoutAdmin from '../../../components/LayoutAdmin'
import ProductTable from '../../../components/ProductTable'
import ProductForm from '../../../components/ProductForm'

export default function ProductosPage() {
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const handleNewProduct = () => {
    setSelectedProduct(null)
    setShowModal(true)
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <LayoutAdmin>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
        <button
          onClick={handleNewProduct}
          className="bg-primary hover:opacity-75 text-white px-4 py-2 rounded"
        >
          + Nuevo Producto
        </button>
      </div>
      <ProductTable onEdit={handleEditProduct} />
      {showModal && <ProductForm onClose={handleCloseModal} productToEdit={selectedProduct} />}
    </LayoutAdmin>
  )
}