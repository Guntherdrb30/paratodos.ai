import Link from 'next/link'
import { FiTool, FiLayers, FiDroplet } from 'react-icons/fi'

const categories = [
  { name: 'Herrajes', icon: FiTool, href: '/tienda?category=Herrajes' },
  { name: 'Fregaderos', icon: FiLayers, href: '/tienda?category=Fregaderos' },
  { name: 'Griferías', icon: FiDroplet, href: '/tienda?category=Griferías' }
]

export default function CategorySection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">Categorías Destacadas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {categories.map(({ name, icon: Icon, href }) => (
            <Link
              key={name}
              href={href}
              className="group block rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="h-48 flex flex-col items-center justify-center bg-white group-hover:bg-accent transition-colors">
                <Icon size={48} className="text-primary mb-4" />
                <span className="text-lg font-semibold text-gray-800">{name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}