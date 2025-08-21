import { useState, useEffect, useMemo } from 'react'
import { db } from '../firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import ProductCard from './ProductCard'
import { categories as navCategories, navStructure } from './Navbar'
import { devError } from '../utils/devLog'

export default function CatalogModule({ category: propCategory = '', onCategoryChange }) {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(propCategory)
  const [brand, setBrand] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const snap = await getDocs(collection(db, 'products'))
        const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setProducts(items)
      } catch (err) {
        devError('Error cargando productos:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    setCategory(propCategory)
  }, [propCategory])

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.marca).filter(Boolean))),
    [products]
  )

  const normalize = (str) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

  const categorySearchMap = useMemo(() => {
    const map = {}
    Object.entries(navStructure).forEach(([parent, childrenObj]) => {
      const parentNorm = normalize(parent)
      const childNames = Object.keys(childrenObj)
      const subitemNames = Object.values(childrenObj).flat()
      map[parentNorm] = [...childNames, ...subitemNames]
      childNames.forEach((child) => {
        const childNorm = normalize(child)
        map[childNorm] = [child, ...(childrenObj[child] || [])]
      })
      subitemNames.forEach((sub) => {
        const subNorm = normalize(sub)
        map[subNorm] = [sub]
      })
    })
    return map
  }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const searchNorm = normalize(search || '')
      let matchesSearch = false
      if (!searchNorm) {
        matchesSearch = true
      } else if (categorySearchMap[searchNorm]) {
        matchesSearch = categorySearchMap[searchNorm].includes(p.categoria)
      } else {
        matchesSearch =
          normalize(p.nombre).includes(searchNorm) ||
          normalize(p.codigo || '').includes(searchNorm) ||
          normalize(p.categoria).includes(searchNorm)
      }
      if (!matchesSearch) return false
      if (category && p.categoria !== category) return false
      if (brand && p.marca !== brand) return false
      if (minPrice && p.precio < Number(minPrice)) return false
      if (maxPrice && p.precio > Number(maxPrice)) return false
      if (inStockOnly && Number(p.stock) <= 0) return false
      return true
    })
  }, [products, search, category, brand, minPrice, maxPrice, inStockOnly])

  if (error) {
    return (
      <div className="text-red-500">
        Error al cargar productos: {error.message}
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <aside className="w-full lg:w-1/4 bg-white p-4 shadow rounded mb-6 lg:mb-0 lg:mr-6">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                onCategoryChange?.(e.target.value)
              }}
              className="w-full border border-gray-300 rounded px-2 py-1"
            >
              <option value="">Todas</option>
              {navCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Marca</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1"
            >
              <option value="">Todas</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Precio (Bs)</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 border border-gray-300 rounded px-2 py-1"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 border border-gray-300 rounded px-2 py-1"
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="inStock"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="inStock" className="text-sm">
              Solo disponibles
            </label>
          </div>
        </div>
      </aside>
      <section className="flex-1">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        {loading ? (
          <p>Cargando productos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full text-center">No se encontraron productos</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}