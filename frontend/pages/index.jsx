import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import CategorySection from '../components/CategorySection'
import FeaturedProducts from '../components/FeaturedProducts'
import HomeLinksSection from '../components/HomeLinksSection'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <CategorySection />
          <FeaturedProducts />
          <HomeLinksSection />
          <Footer />
        </main>
      </div>
    </div>
  )
}
