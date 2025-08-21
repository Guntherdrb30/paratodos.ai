import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import {
  collection,
  addDoc,
  doc,
  getDocs,
  serverTimestamp,
  getDoc
} from 'firebase/firestore'
import axios from 'axios'
import { FaSearch, FaTimes } from 'react-icons/fa'
import { devError } from '../utils/devLog'

export default function SalesForm({ onClose }) {
  const { user } = useAuth()
  const [orderNumber, setOrderNumber] = useState('')
  const [sellerName, setSellerName] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [items, setItems] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [searchProd, setSearchProd] = useState('')
  const [selectedProd, setSelectedProd] = useState(null)
  const [searchField, setSearchField] = useState('codigo')
  const [priceType, setPriceType] = useState('mayor')
  const [quantity, setQuantity] = useState(1)
  const [rate, setRate] = useState(1)
  const [showProdModal, setShowProdModal] = useState(false)

  useEffect(() => {
    if (!user) return
    const init = async () => {
      const num = await generateOrderNumber()
      setOrderNumber(num)
      setSellerName(user.displayName || user.email || '')
      const rateDoc = await getDoc(doc(db, 'settings', 'exchangeRate'))
      if (rateDoc.exists()) setRate(rateDoc.data().value)
      try {
        const prodsSnap = await getDocs(collection(db, 'products'))
        const prodsList = prodsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setAllProducts(prodsList)
      } catch (err) {
        devError('Error fetching products from Firestore:', err)
      }
    }
    init()
  }, [user])

  const generateOrderNumber = async () => {
    const snap = await getDocs(collection(db, 'sales'))
    const nums = snap.docs
      .map((d) => d.data().orderNumber)
      .filter(Boolean)
      .map((n) => parseInt(n.replace('ORD-', ''), 10))
      .filter((n) => !isNaN(n))
    const max = nums.length ? Math.max(...nums) : 0
    return `ORD-${String(max + 1).padStart(5, '0')}`
  }

  const addItem = () => {
    if (!selectedProd) return
    const rawPrice =
      priceType === 'mayor'
        ? selectedProd.precio_mayor
        : priceType === 'aliados'
        ? selectedProd.precio_aliados
        : selectedProd.precio_cliente
    const priceDollar = rawPrice ?? selectedProd.precio
    const bs = priceDollar * rate
    const sub = bs * quantity
    setItems([
      ...items,
      {
        productId: selectedProd.id,
        code: selectedProd.codigo,
        name: selectedProd.nombre,
        priceType,
        priceDollar,
        priceBs: bs,
        quantity,
        subtotalBs: sub,
        stock: selectedProd.stock
      }
    ])
    setSelectedProd(null)
    setSearchProd('')
    setPriceType('mayor')
    setQuantity(1)
  }

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    for (let it of items) {
      if (it.quantity > it.stock) {
        alert(`Stock insuficiente para ${it.name}`)
        return
      }
    }
    for (let it of items) {
      await axios.put(`/api/products/${it.productId}`, {
        stock: it.stock - it.quantity
      })
    }
    const totalBs = items.reduce((sum, i) => sum + i.subtotalBs, 0)
    const data = {
      orderNumber,
      seller: sellerName,
      sellerId: user.uid,
      client: { name: clientName, id: clientId, address: clientAddress, phone: clientPhone },
      items,
      totalBs,
      createdAt: serverTimestamp()
    }
    await addDoc(collection(db, 'sales'), data)
    onClose()
  }

  const filteredProds = allProducts.filter((p) => {
    const term = searchProd.toLowerCase()
    if (!searchProd) return true
    if (searchField === 'codigo') {
      return p.codigo.toLowerCase().includes(term)
    }
    if (searchField === 'nombre') {
      return p.nombre.toLowerCase().includes(term)
    }
    return (
      p.codigo.toLowerCase().includes(term) ||
      p.nombre.toLowerCase().includes(term)
    )
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-auto z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl mt-10 mb-10">
        <h2 className="text-xl font-semibold mb-4">Nueva Orden de Venta</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Orden</label>
              <input
                type="text"
                value={orderNumber}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Vendedor</label>
              <input
                type="text"
                value={sellerName}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Cliente</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Cédula / RIF</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>
          <hr className="my-4" />
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Productos</label>
            <button
              type="button"
              onClick={() => setShowProdModal(true)}
              className="flex items-center px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
            >
              <FaSearch className="mr-2 text-gray-600" /> Agregar productos
            </button>
          </div>

          {showProdModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-auto z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-lg mt-10 mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Buscar Productos</h3>
                  <button onClick={() => setShowProdModal(false)}>
                    <FaTimes className="text-gray-600" />
                  </button>
                </div>
                <div className="flex space-x-4 mb-4">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded ${searchField === 'codigo' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setSearchField('codigo')}
                  >
                    Código
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded ${searchField === 'nombre' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setSearchField('nombre')}
                  >
                    Nombre
                  </button>
                </div>
                <div className="mb-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchProd}
                      onChange={(e) => setSearchProd(e.target.value)}
                      placeholder="Buscar por código o nombre"
                      className="w-full border px-10 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <ul className="border max-h-40 overflow-auto mt-1 bg-white rounded shadow">
                    {filteredProds.map((p) => (
                      <li
                        key={p.id}
                        onClick={() => setSelectedProd(p)}
                        className="p-2 cursor-pointer hover:bg-gray-100"
                      >
                        {p.codigo} - {p.nombre}
                      </li>
                    ))}
                  </ul>
                </div>
                {selectedProd && (
                  <div className="border p-4 rounded mb-4 bg-gray-50">
                    <p>
                      <strong>Código:</strong> {selectedProd.codigo}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {selectedProd.nombre}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div>
                        <label className="block text-gray-700 mb-1">Tipo de precio</label>
                        <select
                          value={priceType}
                          onChange={(e) => setPriceType(e.target.value)}
                          className="w-full border px-3 py-2 rounded"
                        >
                          <option value="mayor">Precio Mayor</option>
                          <option value="aliados">Precio Aliados</option>
                          <option value="cliente">Precio Cliente Final</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Cantidad</label>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full border px-3 py-2 rounded"
                        />
                      </div>
                      <div className="self-end">
                        <button
                          type="button"
                          onClick={() => {
                            addItem()
                            setShowProdModal(false)
                          }}
                          className="mt-2 px-4 py-2 bg-primary text-white rounded hover:opacity-75"
                        >
                          Agregar a orden
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p><strong>Precio unitario Bs:</strong> {(((priceType === 'mayor' ? selectedProd.precio_mayor : priceType === 'aliados' ? selectedProd.precio_aliados : selectedProd.precio_cliente) ?? selectedProd.precio) * rate).toFixed(2)}</p>
                      <p><strong>Subtotal Bs:</strong> {(((priceType === 'mayor' ? selectedProd.precio_mayor : priceType === 'aliados' ? selectedProd.precio_aliados : selectedProd.precio_cliente) ?? selectedProd.precio) * rate * quantity).toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 mb-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo precio</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal Bs</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 whitespace-nowrap">{it.code}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{it.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{it.priceType}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{it.quantity}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{it.subtotalBs.toFixed(2)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="text-right text-lg font-semibold mb-4">
            Total Bs: {items.reduce((sum, i) => sum + i.subtotalBs, 0).toFixed(2)}
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
              Confirmar Venta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}