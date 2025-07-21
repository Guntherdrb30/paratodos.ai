import Header from '../../components/Header'
import Navbar from '../../components/Navbar'
import CartModule from '../../components/CartModule'

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <CartModule />
        </main>
      </div>
    </div>
  )
}