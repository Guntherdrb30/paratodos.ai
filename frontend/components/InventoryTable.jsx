import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import * as XLSX from 'xlsx'
import { FaSearch, FaFileExcel, FaFilePdf } from 'react-icons/fa'


export default function InventoryTable() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [monthlyData, setMonthlyData] = useState(null)
  const [bestProduct, setBestProduct] = useState(null)
  const [bestTotal, setBestTotal] = useState(0)
  const [worstProduct, setWorstProduct] = useState(null)
  const [worstTotal, setWorstTotal] = useState(0)
  const [productSales, setProductSales] = useState(null)
  const [productSalesTotals, setProductSalesTotals] = useState({ totalQuantity: 0, totalAmount: 0 })

  const fetchProducts = async (type = 'all') => {
    try {
      let url = '/api/products'
      if (type === 'most-sold') url = '/api/products/most-sold'
      else if (type === 'least-sold') url = '/api/products/least-sold'
      else if (type === 'low-stock') url = '/api/products/low-stock'
      const { data } = await axios.get(url)

      if (type === 'most-sold') {
        setBestProduct(data.product)
        setBestTotal(data.totalAmount)
        setMonthlyData(data.monthly)
        setWorstProduct(null)
        setWorstTotal(0)
        setProducts([])
        setFiltered([])
        setProductSales(null)
        return
      }
      if (type === 'least-sold') {
        setWorstProduct(data.product)
        setWorstTotal(data.totalAmount)
        setMonthlyData(data.monthly)
        setBestProduct(null)
        setBestTotal(0)
        setProducts([])
        setFiltered([])
        setProductSales(null)
        return
      }

      setBestProduct(null)
      setBestTotal(0)
      setWorstProduct(null)
      setWorstTotal(0)
      setMonthlyData(null)
      setProductSales(null)
      data.sort((a, b) => a.nombre.localeCompare(b.nombre))
      setProducts(data)
      setFiltered(data)
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  useEffect(() => {
    fetchProducts(filter)
  }, [filter])

  useEffect(() => {
    const term = search.toLowerCase()
    setFiltered(
      products.filter(
        (p) =>
          p.codigo?.toLowerCase().includes(term) ||
          p.nombre?.toLowerCase().includes(term)
      )
    )
  }, [search, products])

  const exportExcel = () => {
    if (filter === 'most-sold' && monthlyData && bestProduct) {
      const dataToExport = monthlyData.map(({ month, count }) => ({
        Mes: month,
        'Cantidad vendida': count
      }))
      const ws = XLSX.utils.json_to_sheet(dataToExport)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Más vendido')
      XLSX.writeFile(wb, `mas-vendido-${bestProduct.codigo || bestProduct.id}.xlsx`)
      return
    }
    if (filter === 'least-sold' && monthlyData && worstProduct) {
      const dataToExport = monthlyData.map(({ month, count }) => ({
        Mes: month,
        'Cantidad vendida': count
      }))
      const ws = XLSX.utils.json_to_sheet(dataToExport)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Menos vendido')
      XLSX.writeFile(wb, `menos-vendido-${worstProduct.codigo || worstProduct.id}.xlsx`)
      return
    }
    const ws = XLSX.utils.json_to_sheet(filtered)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario')
    XLSX.writeFile(wb, 'inventario.xlsx')
  }

  const handleViewProductDetails = async (code) => {
    try {
      const { data } = await axios.get(`/api/products/${code}/sales`)
      setProductSales(data.sales)
      setProductSalesTotals({ totalQuantity: data.totalQuantity, totalAmount: data.totalAmount })
    } catch (err) {
      console.error('Error fetching product sales:', err)
    }
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

    if (filter === 'most-sold' && monthlyData && bestProduct) {
      const body = [
        ['Mes', 'Cantidad vendida'],
        ...monthlyData.map((m) => [m.month, m.count])
      ]
      const docDefinition = {
        content: [
          { image: logoDataUrl, width: 150, margin: [0, 0, 0, 10] },
          { text: `Más vendido: ${bestProduct.nombre}`, style: 'header' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body
            }
          }
        ],
        styles: {
          header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
        }
      }
      pdfMake.createPdf(docDefinition).download(
        `mas-vendido-${bestProduct.codigo || bestProduct.id}.pdf`
      )
      return
    }

    if (filter === 'least-sold' && monthlyData && worstProduct) {
      const body = [
        ['Mes', 'Cantidad vendida'],
        ...monthlyData.map((m) => [m.month, m.count])
      ]
      const docDefinition = {
        content: [
          { image: logoDataUrl, width: 150, margin: [0, 0, 0, 10] },
          { text: `Menos vendido: ${worstProduct.nombre}`, style: 'header' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body
            }
          }
        ],
        styles: {
          header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
        }
      }
      pdfMake.createPdf(docDefinition).download(
        `menos-vendido-${worstProduct.codigo || worstProduct.id}.pdf`
      )
      return
    }

    const body = [
      ['Código', 'Nombre', 'Stock', 'Stock Mínimo'],
      ...filtered.map((p) => [p.codigo, p.nombre, p.stock, p.stock_minimo])
    ]
    const docDefinition = {
      content: [
        { image: logoDataUrl, width: 150, margin: [0, 0, 0, 10] },
        { text: 'Inventario', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'],
            body
          }
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
      }
    }
    pdfMake.createPdf(docDefinition).download('inventario.pdf')
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-2 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 border rounded w-full md:w-64"
              placeholder="Buscar código o nombre"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className={`px-3 py-1 rounded ${
              filter === 'most-sold'
                ? 'bg-primary text-white'
                : 'bg-gray-200'
            }`}
            onClick={() => setFilter('most-sold')}
          >
            Más vendidos
          </button>
          <button
            className={`px-3 py-1 rounded ${
              filter === 'least-sold'
                ? 'bg-primary text-white'
                : 'bg-gray-200'
            }`}
            onClick={() => setFilter('least-sold')}
          >
            Menos vendidos
          </button>
          <button
            className={`px-3 py-1 rounded ${
              filter === 'low-stock'
                ? 'bg-primary text-white'
                : 'bg-gray-200'
            }`}
            onClick={() => setFilter('low-stock')}
          >
            Stock mínimo
          </button>
          <button
            className={`px-3 py-1 rounded ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-200'
            }`}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded"
            onClick={exportExcel}
          >
            <FaFileExcel />
            <span>Excel</span>
          </button>
          <button
            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded"
            onClick={exportPdf}
          >
            <FaFilePdf />
            <span>PDF</span>
          </button>
        </div>
      </div>
      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        {(filter === 'most-sold' && bestProduct) || (filter === 'least-sold' && worstProduct) ? (
          <div className="p-4">
            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad vendida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto total Bs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {filter === 'most-sold' ? bestProduct.codigo : worstProduct.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {filter === 'most-sold' ? bestProduct.nombre : worstProduct.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {filter === 'most-sold' ? bestTotal : worstTotal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(filter === 'most-sold' ? bestTotal : worstTotal).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleViewProductDetails(
                          filter === 'most-sold' ? bestProduct.codigo : worstProduct.codigo
                        )
                      }
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad vendida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Bs
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyData.map((m) => (
                  <tr key={m.month}>
                    <td className="px-6 py-4 whitespace-nowrap">{m.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{m.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{m.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productSales && (
              <div>
                <h2 className="text-xl font-bold mb-2">Detalle de Ventas</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orden
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal Bs
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productSales.map((s) => (
                        <tr key={s.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{s.orderNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{s.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{s.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{s.subtotalBs.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                const parts = router.pathname.split('/')
                                const role = parts[2] || 'admin'
                                router.push(`/dashboard/${role}/ventas/${s.id}`)
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Ver orden
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td className="px-6 py-4 whitespace-nowrap">Total</td>
                        <td />
                        <td className="px-6 py-4 whitespace-nowrap">{productSalesTotals.totalQuantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{productSalesTotals.totalAmount.toFixed(2)}</td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Mínimo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className={
                    Number(p.stock) <= Number(p.stock_minimo)
                      ? 'bg-red-50'
                      : ''
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">{p.codigo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {p.stock_minimo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => {
                        const parts = router.pathname.split('/')
                        const role = parts[2] || 'admin'
                        router.push(`/dashboard/${role}/inventario/${p.id}`)
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}