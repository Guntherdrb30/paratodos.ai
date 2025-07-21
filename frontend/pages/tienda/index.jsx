import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import Navbar from '../../components/Navbar'
import CatalogModule from '../../components/CatalogModule'

export default function TiendaPage() {
  const router = useRouter()
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (router.isReady && router.query.category) {
      setCategory(String(router.query.category))
    }
  }, [router.isReady, router.query.category])

  // filter state passed to CatalogModule via props
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Navbar onCategorySelect={setCategory} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <CatalogModule
            category={category}
            onCategoryChange={setCategory}
          />
        </main>
      </div>
    </div>
  )
}