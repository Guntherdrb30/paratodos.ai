import { useState } from 'react'
import { useRouter } from 'next/router'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'

export const navStructure = {
  'Carpintería': {
    'Herrajes': [
      'Elevadores de puertas superiores',
      'Bisagras',
      'Correderas',
      'Condimenteros',
      'Esquineros'
    ],
    'Accesorios': [],
    'Laminados HPL': []
  },
  'Hogar': {
    'Lavamanos': [],
    'Fregaderos': [],
    'Griferías': [],
    'Piezas sanitarias': [],
    'Porcelanatos': [],
    'Paneles WPC': [],
    'Pisos de vinil': []
  }
}

export const categories = Object.keys(navStructure)

export default function Navbar({ onCategorySelect }) {
  const router = useRouter()
  const [openParents, setOpenParents] = useState({})
  const [openChildren, setOpenChildren] = useState({})

  const toggleParent = (parent) => {
    setOpenParents((prev) => ({ ...prev, [parent]: !prev[parent] }))
  }

  const toggleChild = (parent, child) => {
    const key = `${parent}|||${child}`
    setOpenChildren((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleNavigation = (name) => {
    if (onCategorySelect) {
      onCategorySelect(name)
    } else {
      router.push(`/tienda?category=${encodeURIComponent(name)}`)
    }
  }

  return (
    <aside className="bg-primary text-white w-75 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
      <nav className="p-4">
        {categories.map((parent) => (
          <div key={parent} className="mb-2">
            <button
              onClick={() => toggleParent(parent)}
              className="flex items-center justify-between w-full py-2 text-left hover:bg-primary/90 rounded px-2"
            >
              <span onClick={() => handleNavigation(parent)}>{parent}</span>
              <FiChevronDown
                className={`transform transition-transform ${openParents[parent] ? 'rotate-180' : ''}`}
              />
            </button>
            {openParents[parent] &&
              Object.entries(navStructure[parent]).map(([child, subitems]) => (
                <div key={child} className="ml-4 mt-1">
                  {subitems.length > 0 ? (
                    <div>
                      <button
                        onClick={() => toggleChild(parent, child)}
                        className="flex items-center justify-between w-full py-1 hover:bg-primary/90 rounded px-2"
                      >
                        <span onClick={() => handleNavigation(child)}>{child}</span>
                        <FiChevronRight
                          className={`transform transition-transform ${
                            openChildren[`${parent}|||${child}`] ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      {openChildren[`${parent}|||${child}`] && (
                        <ul className="mt-1 space-y-1">
                          {subitems.map((sub) => (
                            <li key={sub}>
                              <button
                                onClick={() => handleNavigation(sub)}
                                className="w-full text-left py-1 hover:bg-primary/90 rounded px-2"
                              >
                                {sub}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavigation(child)}
                      className="w-full text-left py-1 hover:bg-primary/90 rounded px-2"
                    >
                      {child}
                    </button>
                  )}
                </div>
              ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}