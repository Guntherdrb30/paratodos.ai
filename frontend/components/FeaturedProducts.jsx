import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, query, limit, getDocs } from 'firebase/firestore'
import ProductCard from './ProductCard'

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), limit(6))
        const snapshot = await getDocs(q)
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setProducts(items)
      } catch (error) {
        console.error('Error cargando productos destacados:', error)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <section className="py-12 bg-accent">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">Productos Destacados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}