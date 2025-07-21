import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Hero() {
  const images = [
    '/images/banner8.png',
    '/images/banner7.png',
    '/images/banner9.png'
  ]
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <section className="relative h-800 md:h-[1600px] overflow-hidden">
      {images.map((src, idx) => (
        <div
          key={src}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url('${src}')` }}
        />
      ))}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-start text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Bienvenido a Carpi Hogar</h1>
        <p className="mb-9 max-w-lg">Descubre la mejor selección de productos para tu hogar y proyecto.</p>
        <Link href="/tienda" className="bg-primary hover:bg-opacity-90 text-white px-6 py-3 rounded">
          Conoce nuestros productos
        </Link>
      </div>
    </section>
  )
}