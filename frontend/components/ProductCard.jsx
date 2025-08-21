import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '../context/CartContext'
import { FiHeart, FiShare2 } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { devError } from '../utils/devLog'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [rate, setRate] = useState(null)
  const [loadingRate, setLoadingRate] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const rateDoc = await getDoc(doc(db, 'settings', 'exchangeRate'))
        setRate(rateDoc.exists() ? rateDoc.data().value : null)
      } catch {
        setRate(null)
      } finally {
        setLoadingRate(false)
      }
    }
    fetchRate()
  }, [])

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
      if (favs.includes(product.id)) setLiked(true)
    } catch {}
  }, [product.id])

  const handleAddToCart = () => {
    addToCart(product)
    alert(`Añadido ${product.nombre} al carrito`)
  }

  const handleToggleFavorite = (e) => {
    e.stopPropagation()
    e.preventDefault()
    try {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
      const updated = liked
        ? favs.filter((id) => id !== product.id)
        : [...favs, product.id]
      localStorage.setItem('favorites', JSON.stringify(updated))
      setLiked(!liked)
    } catch (error) {
      devError('Error actualizando favoritos', error)
    }
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    const url = window.location.origin + '/tienda/' + product.id
    try {
      if (navigator.share) {
        await navigator.share({ title: product.nombre, url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Enlace copiado al portapapeles')
      }
    } catch (error) {
      devError('Error compartiendo', error)
    }
  }

  const handleWhatsAppShare = (e) => {
    e.stopPropagation()
    e.preventDefault()
    const url = window.location.origin + '/tienda/' + product.id
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <Link href={`/tienda/${product.id}`} legacyBehavior>
      <a className="group block border border-gray-200 rounded-2xl overflow-hidden bg-white shadow hover:shadow-xl hover:border-primary transition-all duration-300 relative">
        <div className="absolute top-2 right-2 z-10 flex space-x-2">
          <button onClick={handleToggleFavorite}>
            <FiHeart
              className={`p-1 rounded-full ${
                liked ? 'bg-primary text-white' : 'bg-white text-gray-400 hover:text-primary'
              } transition-colors duration-200`}
            />
          </button>
          <button onClick={handleShare}>
            <FiShare2 className="p-1 bg-white text-gray-400 rounded-full hover:text-primary transition-colors duration-200" />
          </button>
          <button onClick={handleWhatsAppShare}>
            <FaWhatsapp className="p-1 bg-white text-gray-400 rounded-full hover:text-green-500 transition-colors duration-200" />
          </button>
        </div>
        <div className="w-full h-64 bg-gray-100 overflow-hidden">
          {product.imagenes && product.imagenes.length > 0 ? (
            <img
              src={product.imagenes[0]}
              alt={product.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Sin imagen
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.nombre}</h3>
          <p
            className="text-sm text-gray-500 mb-2"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {product.descripcion}
          </p>
          <div className="mt-auto flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-primary mr-2">
                ${Number(product.precio).toFixed(2)}
              </span>
              {!loadingRate && rate && (
                <span className="text-sm text-gray-500">
                  Bs {(Number(product.precio) * rate).toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
            >
              Agregar
            </button>
          </div>
        </div>
      </a>
    </Link>
  )
}