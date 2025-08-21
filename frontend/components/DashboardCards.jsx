import { useEffect, useState } from 'react'
import { FaShoppingCart, FaBoxOpen, FaUsers, FaProjectDiagram } from 'react-icons/fa'
import { db } from '../firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import { devError } from '../utils/devLog'

export default function DashboardCards() {
  const [data, setData] = useState({ ventas: 0, productos: 0, usuarios: 0, proyectos: 0 })

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [ventasSnap, productosSnap, usuariosSnap, proyectosSnap] = await Promise.all([
          getDocs(collection(db, 'sales')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'projects')),
        ])
        setData({
          ventas: ventasSnap.size,
          productos: productosSnap.size,
          usuarios: usuariosSnap.size,
          proyectos: proyectosSnap.size,
        })
      } catch (error) {
        devError('Error fetching dashboard counts:', error)
      }
    }
    fetchCounts()
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
        <FaShoppingCart className="text-primary text-3xl" />
        <div>
          <p className="text-sm text-gray-500">Total Ventas</p>
          <p className="text-2xl font-bold">{data.ventas}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
        <FaBoxOpen className="text-primary text-3xl" />
        <div>
          <p className="text-sm text-gray-500">Productos Activos</p>
          <p className="text-2xl font-bold">{data.productos}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
        <FaUsers className="text-primary text-3xl" />
        <div>
          <p className="text-sm text-gray-500">Usuarios</p>
          <p className="text-2xl font-bold">{data.usuarios}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
        <FaProjectDiagram className="text-primary text-3xl" />
        <div>
          <p className="text-sm text-gray-500">Proyectos en Curso</p>
          <p className="text-2xl font-bold">{data.proyectos}</p>
        </div>
      </div>
    </div>
  )
}