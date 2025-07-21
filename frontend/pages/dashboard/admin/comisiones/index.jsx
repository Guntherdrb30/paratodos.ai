import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../../../context/AuthContext'
import { db } from '../../../../firebase/config'
import { collection, getDocs, onSnapshot } from 'firebase/firestore'
import * as XLSX from 'xlsx'
import { FaSearch, FaFileExcel, FaFilePdf, FaEye } from 'react-icons/fa'
import LayoutAdmin from '../../../../components/LayoutAdmin'

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function ComisionesPage() {
  const { role } = useAuth()
  const [vendors, setVendors] = useState([])
  const [sales, setSales] = useState([])
  const [search, setSearch] = useState('')
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchVendors = async () => {
      const snap = await getDocs(collection(db, 'users'))
      const list = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.rol === 'vendedor')
      setVendors(list)
    }
    fetchVendors()
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setSales(list)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const term = search.toLowerCase()
    const filtered = vendors
      .map((vendor) => {
        const comRate = vendor.comision ?? 0
        const vendSales = sales.filter(
          (s) =>
            s.sellerId === vendor.id &&
            s.createdAt?.toDate().getMonth() + 1 === filterMonth &&
            s.createdAt?.toDate().getFullYear() === filterYear
        )
        const numSales = vendSales.length
        const totalSales = vendSales.reduce((sum, s) => sum + (s.totalBs || 0), 0)
        const commissionTotal = (totalSales * comRate) / 100
        return {
          id: vendor.id,
          nombre: vendor.nombre,
          numSales,
          totalSales,
          comRate,
          commissionTotal,
        }
      })
      .filter(
        (item) =>
          item.nombre.toLowerCase().includes(term) ||
          item.id.toLowerCase().includes(term)
      )
    setData(filtered)
  }, [vendors, sales, search, filterMonth, filterYear])

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Código: item.id,
        Nombre: item.nombre,
        'Cantidad de ventas': item.numSales,
        'Total vendido Bs': item.totalSales.toFixed(2),
        'Porcentaje comisión (%)': item.comRate,
        'Comisión total Bs': item.commissionTotal.toFixed(2),
      }))
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Comisiones')
    XLSX.writeFile(wb, 'comisiones.xlsx')
  }

  const getLogoDataUrl = async () => {
    const response = await fetch('/images/logo-carpihogar.jpg')
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const exportPdf = async () => {
    const pdfMakeModule = await import('pdfmake/build/pdfmake')
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts')
    const pdfMake = pdfMakeModule.default || pdfMakeModule
    const pdfFonts = pdfFontsModule.default || pdfFontsModule
    pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts

    const logoDataUrl = await getLogoDataUrl()
    const body = [
      [
        'Código', 'Nombre', 'Cant. ventas', 'Total vendido Bs',
        '% comisión', 'Comisión total Bs'
      ],
      ...data.map((item) => [
        item.id,
        item.nombre,
        item.numSales,
        item.totalSales.toFixed(2),
        item.comRate,
        item.commissionTotal.toFixed(2),
      ])
    ]
    const docDefinition = {
      content: [
        { image: logoDataUrl, width: 150, margin: [0, 0, 0, 10] },
        { text: 'Gestión de comisiones por vendedor', style: 'header' },
        { table: { headerRows: 1, widths: ['*','*','*','*','*','*'], body } }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
      }
    }
    pdfMake.createPdf(docDefinition).download('comisiones.pdf')
  }

  return (
    <LayoutAdmin>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de comisiones por vendedor</h1>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-2 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 border rounded w-full md:w-64"
              placeholder="Buscar vendedor o código"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="border px-3 py-2 rounded"
          >
            {monthNames.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="border px-3 py-2 rounded"
          >
            {[...new Set(sales.map((s) => s.createdAt?.toDate().getFullYear()))]
              .sort((a, b) => b - a)
              .map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportExcel}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <FaFileExcel />
            <span>Excel</span>
          </button>
          <button
            onClick={exportPdf}
            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <FaFilePdf />
            <span>PDF</span>
          </button>
        </div>
      </div>
      {data.length === 0 ? (
        <p>No se encontraron resultados para esa búsqueda</p>
      ) : (
        <div className="overflow-x-auto shadow border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cant. ventas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total vendido Bs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% comisión</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión total Bs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.numSales}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.totalSales.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.comRate}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.commissionTotal.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/dashboard/admin/comisiones/${item.id}?month=${filterMonth}&year=${filterYear}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FaEye />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </LayoutAdmin>
  )
}