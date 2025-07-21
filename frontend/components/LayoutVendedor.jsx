import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'firebase/auth'
import { useAuth } from '../context/AuthContext'
import { auth } from '../firebase/config'
import SidebarVendedor from './SidebarVendedor'
import { FiLogOut } from 'react-icons/fi'

export default function LayoutVendedor({ children }) {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/auth/login')
  }

  return (
    <div className="flex">
      <SidebarVendedor />
      <div className="flex flex-col flex-1 ml-64">
        <header className="fixed top-0 left-64 right-0 h-16 bg-secondary text-white flex items-center justify-between px-6 z-10">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-primary">
              Carpi Hogar
            </Link>
            <span className="text-sm">{user?.displayName || user?.email}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-2 hover:opacity-75">
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </header>
        <main className="pt-16 p-6 bg-accent min-h-screen">{children}</main>
      </div>
    </div>
  )
}