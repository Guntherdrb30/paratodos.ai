import Link from 'next/link'

export default function HomeLinksSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-center space-x-8 mb-4">
          <Link href="/proyectos" className="text-4xl font-medium text-gray-800 hover:text-gray-600">
            Proyectos
          </Link>
          <Link href="/marcas" className="text-4xl font-medium text-gray-800 hover:text-gray-600">
            Marcas
          </Link>
          <Link href="/auth/login" className="text-4xl font-medium text-gray-800 hover:text-gray-600">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  )
}