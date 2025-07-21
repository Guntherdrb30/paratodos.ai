import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

const LOW_STOCK_THRESHOLD = 5

export default function InventoryModule({ readOnly = false }) {
  const { role } = useAuth()
  const isReadOnly = readOnly || role === 'vendedor'
  const [products, setProducts] = useState([])
  const [salesCounts, setSalesCounts] = useState({})
  const [search, setSearch] = useState('')
  const [view, setView] = useState('all') // 'all', 'best', 'lowStock', 'worst'

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), orderBy('nombre', 'asc'))
      const snap = await getDocs(q)
      setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const fetchSales = async () => {
      const snap = await getDocs(collection(db, 'sales'))
      const counts = {}
      snap.docs.forEach((doc) => {
        const s = doc.data()
        const key = s.producto
        const qty = Number(s.cantidad) || 0
        counts[key] = (counts[key] || 0) + qty
      })
      setSalesCounts(counts)
    }
    fetchSales()
  }, [])

  const filteredProducts = useMemo(() => {
    let list = [...products]
    if (search.trim()) {
      list = list.filter(
        (p) =>
          p.codigo?.toLowerCase().includes(search.toLowerCase()) ||
          p.nombre.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (view === 'best') {
      list = list
        .sort((a, b) => (salesCounts[b.nombre] || 0) - (salesCounts[a.nombre] || 0))
        .slice(0, 10)
    } else if (view === 'worst') {
      list = list
        .sort((a, b) => (salesCounts[a.nombre] || 0) - (salesCounts[b.nombre] || 0))
        .slice(0, 10)
    } else if (view === 'lowStock') {
      list = list.filter((p) => Number(p.stock) <= LOW_STOCK_THRESHOLD)
    } else {
      list = list.sort((a, b) => a.nombre.localeCompare(b.nombre))
    }
    return list
  }, [products, salesCounts, search, view])

  return (
    <div className="flex">
      <aside className="w-1/4 pr-4">
        <nav className="space-y-2">
          <button
            onClick={() => setView('all')}
            className={view === 'all' ? 'font-semibold' : ''}
          >
            Todos los productos
          </button>
          <button
            onClick={() => setView('best')}
            className={view === 'best' ? 'font-semibold' : ''}
          >
            Top 10 más vendidos
          </button>
          <button
            onClick={() => setView('lowStock')}
            className={view === 'lowStock' ? 'font-semibold' : ''}
          >
            Existencia mínima
          </button>
          <button
            onClick={() => setView('worst')}
            className={view === 'worst' ? 'font-semibold' : ''}
          >
            Menos vendidos
          </button>
        </nav>
      </aside>
      <section className="w-3/4">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Buscar por código o nombre"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded w-1/3"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Código
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Descripción
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Precio
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                {(view === 'best' || view === 'worst') && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendidos
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 whitespace-nowrap">{p.codigo}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{p.nombre}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{p.descripcion}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{p.precio}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{p.stock}</td>
                  {(view === 'best' || view === 'worst') && (
                    <td className="px-4 py-2 whitespace-nowrap">
                      {salesCounts[p.nombre] || 0}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}