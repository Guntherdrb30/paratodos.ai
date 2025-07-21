import Link from 'next/link'
import { FiShoppingCart, FiUser, FiSearch } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import AIAdvisor from './AIAdvisor'

export default function Header() {
  const [showAdvisor, setShowAdvisor] = useState(false)
  const [advisorQuery, setAdvisorQuery] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')

  const handleAdvisorSubmit = (e) => {
    e.preventDefault()
    if (!advisorQuery.trim()) return
    setShowAdvisor(true)
  }
  const { cartItems } = useCart()

  useEffect(() => {
    const fetchWhatsapp = async () => {
      const waDoc = await getDoc(doc(db, 'settings', 'whatsappNumber'))
      if (waDoc.exists()) setWhatsappNumber(waDoc.data().value)
    }
    fetchWhatsapp()
  }, [])

  return (
    <>
      <header className="bg-grey shadow">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="flex items-center -ml-4">
            <img
              src="/images/logo-carpihogar.jpg"
              alt="Carpi Hogar"
              className="h-30 md:h-40"
            />
          </Link>
          <div className="flex items-center space-x-2 ml-6 text-secondary text-sm">
            <span>Envíos a nivel nacional</span>
            <span className="text-lg">🇻🇪</span>
          </div>
          <form onSubmit={handleAdvisorSubmit} className="flex-1 flex justify-center px-4">
            <div className="relative w-full max-w-xs">
              <FiSearch size={30} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Asesoramiento ia"
                className="w-full border border-gray-300 rounded py-3 pl-10 pr-4 placeholder-gray-500 placeholder-opacity-50"
                value={advisorQuery}
                onChange={(e) => setAdvisorQuery(e.target.value)}
              />
            </div>
          </form>
          <div className="flex items-center space-x-8 text-secondary">
            <Link href="/tienda/cart" className="relative hover:text-primary">
              <FiShoppingCart size={40} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
            <Link
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1ebe57] text-white px-4 py-2 rounded inline-flex items-center space-x-2"
            >
              <FaWhatsapp size={20} />
              <span>Contáctanos</span>
            </Link>
            <Link href="/auth/login" className="hover:text-primary">
              <FiUser size={40} />
            </Link>
          </div>
        </div>
      </header>
      {showAdvisor && (
        <AIAdvisor
          onClose={() => setShowAdvisor(false)}
          initialMessage={advisorQuery}
        />
      )}
    </>
  )
}