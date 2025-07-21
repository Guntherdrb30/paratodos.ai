import { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function ProductCarousel({ images = [] }) {
  const [current, setCurrent] = useState(0)

  if (!images || images.length === 0) return null

  const prev = () => setCurrent((current - 1 + images.length) % images.length)
  const next = () => setCurrent((current + 1) % images.length)

  return (
    <div className="relative w-full h-96 bg-gray-100 overflow-hidden rounded-lg">
      <img
        src={images[current]}
        alt={`Imagen ${current + 1}`}
        className="w-full h-full object-cover"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
          >
            <FiChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  )
}