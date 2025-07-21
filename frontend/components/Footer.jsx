import Link from 'next/link'
import { FaInstagram, FaTwitter } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center space-x-6 mb-6">
          <Link href="/sobre-nosotros" className="text-base text-gray-600 hover:text-gray-800">
            Sobre nosotros
          </Link>
          <Link href="/contacto" className="text-base text-gray-600 hover:text-gray-800">
            Contáctanos
          </Link>
          <Link href="/terminos" className="text-base text-gray-600 hover:text-gray-800">
            Términos y Condiciones
          </Link>
          <Link href="/privacidad" className="text-base text-gray-600 hover:text-gray-800">
            Política de Privacidad
          </Link>
          <Link href="/ayuda" className="text-base text-gray-600 hover:text-gray-800">
            Ayuda
          </Link>
        </div>
        <div className="flex justify-center space-x-6 mb-6">
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
            <FaInstagram size={24} />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
            <FaTwitter size={24} />
          </a>
        </div>
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} CarpiHogar. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}