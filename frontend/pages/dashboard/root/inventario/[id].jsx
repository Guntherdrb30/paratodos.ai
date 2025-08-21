import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import LayoutRoot from '../../../../components/LayoutRoot'
import { devError } from '../../../../utils/devLog'

export default function ProductDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState(null)
  const [salesList, setSalesList] = useState([])
  const [totalQuantity, setTotalQuantity] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    precio: '',
    descripcion: '',
    categoria: '',
    marca: '',
    proveedor: '',
    stock: 0,
    stock_minimo: 0
  })

  useEffect(() => {
    if (id) {
      axios
        .get(`/api/products/${id}`)
        .then(({ data }) => {
          setProduct(data)
          setFormData({
            codigo: data.codigo || '',
            nombre: data.nombre || '',
            precio: data.precio || '',
            descripcion: data.descripcion || '',
            categoria: data.categoria || '',
            marca: data.marca || '',
            proveedor: data.proveedor || '',
            stock: data.stock || 0,
            stock_minimo: data.stock_minimo || 0
          })
        })
        .catch((err) => devError(err))
        .finally(() => setLoading(false))
    }
  }, [id])

  useEffect(() => {
    if (product?.codigo) {
      axios
        .get(`/api/products/${product.codigo}/sales`)
        .then(({ data }) => {
          setSalesList(data.sales)
          setTotalQuantity(data.totalQuantity)
          setTotalAmount(data.totalAmount)
        })
        .catch((err) => devError('Error fetching product sales:', err))
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.put(`/api/products/${id}`, formData)
      alert('Producto actualizado correctamente')
      router.back()
    } catch (err) {
      devError(err)
      alert('Error al actualizar producto')
    } finally {
      setSaving(false)
    }
  }

  const handleRequestPurchase = async () => {
    try {
      await axios.post('/api/compras', { productId: id })
      alert('Solicitud de compra enviada')
    } catch (err) {
      devError(err)
      alert('Error al enviar solicitud de compra')
    }
  }

  if (loading) {
    return (
      <LayoutRoot>
        <p>Cargando...</p>
      </LayoutRoot>
    )
  }

  return (
    <LayoutRoot>
      <h1 className="text-2xl font-bold mb-4">Detalle del Producto</h1>
      <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Código</label>
            <input
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Nombre</label>
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Precio</label>
            <input
              type="number"
              step="0.01"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Categoría</label>
            <input
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Marca</label>
            <input
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Proveedor</label>
            <input
              name="proveedor"
              value={formData.proveedor}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Stock Mínimo</label>
            <input
              type="number"
              name="stock_minimo"
              value={formData.stock_minimo}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded hover:opacity-75"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          {Number(formData.stock) <= Number(formData.stock_minimo) && (
            <button
              type="button"
              onClick={handleRequestPurchase}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:opacity-80"
            >
              Agregar a solicitud de compra
            </button>
          )}
        </div>
      </form>
      <hr className="my-6" />
      <h2 className="text-xl font-bold mb-4">Ventas del Producto</h2>
      {salesList.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal Bs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesList.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{s.orderNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{s.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{s.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{s.subtotalBs.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => router.push(`/dashboard/root/ventas/${s.id}`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Ver orden
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-6 py-4 whitespace-nowrap">Total</td>
                <td />
                <td className="px-6 py-4 whitespace-nowrap">{totalQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">{totalAmount.toFixed(2)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p>No hay ventas para este producto.</p>
      )}
    </LayoutRoot>
  )
}