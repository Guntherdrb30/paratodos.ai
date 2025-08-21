import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import Navbar from '../../components/Navbar'
import ProductCarousel from '../../components/ProductCarousel'
import { useCart } from '../../context/CartContext'
import { FiHeart } from 'react-icons/fi'
import { db } from '../../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { devError } from '../../utils/devLog'

export default function ProductDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState(null)
  const [rate, setRate] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const prodRef = doc(db, 'products', id)
        const prodSnap = await getDoc(prodRef)
        if (prodSnap.exists()) {
          setProduct({ id: prodSnap.id, ...prodSnap.data() })
        }
        const rateRef = doc(db, 'settings', 'exchangeRate')
        const rateSnap = await getDoc(rateRef)
        setRate(rateSnap.exists() ? rateSnap.data().value : null)
      } catch (error) {
        devError('Error cargando detalle de producto:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleAdd = () => {
    if (product) {
      addToCart(product)
      alert(`Añadido ${product.nombre} al carrito`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando producto...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Producto no encontrado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <ProductCarousel images={product.imagenes} />
            </div>
            <div className="md:w-1/2 flex flex-col">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">{product.nombre}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-2xl font-bold text-primary">
                  ${Number(product.precio).toFixed(2)}
                </span>
                {rate && (
                  <span className="text-lg text-gray-500">
                    Bs {(Number(product.precio) * rate).toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-gray-700 mb-6">{product.descripcion}</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleAdd}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                >
                  Agregar al carrito
                </button>
                <FiHeart
                  size={24}
                  className="text-gray-600 hover:text-primary cursor-pointer transition-colors duration-300"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}