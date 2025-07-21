import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore'

export default function ProductTable({ onEdit }) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsub()
  }, [])

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteDoc(doc(db, 'products', id))
    }
  }

  return (
    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Imagen
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Código
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nombre
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Precio
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Descripción
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Categoría
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Marca
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Proveedor
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Stock
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Stock Mínimo
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Acciones
          </th>
        </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {product.imagenes && product.imagenes.length > 0 ? (
                  <img
                    src={product.imagenes[0]}
                    alt={product.nombre}
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-200 flex items-center justify-center rounded text-gray-500">
                    Sin Img
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{product.codigo}</td>
              <td className="px-6 py-4 whitespace-nowrap">{product.nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap">{product.precio}</td>
              <td className="px-6 py-4 whitespace-nowrap">{product.descripcion}</td>
              <td className="px-6 py-4 whitespace-nowrap">{product.categoria}</td>
              <td className="px-6 py-4 whitespace-nowrap">{product.marca || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{product.proveedor || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
              <td className="px-6 py-4 whitespace-nowrap">{product.stock_minimo ?? '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <button
                  onClick={() => onEdit(product)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
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
  )
}