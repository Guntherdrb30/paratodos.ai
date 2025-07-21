import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase/config'
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import * as XLSX from 'xlsx'
import { FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaEye } from 'react-icons/fa'

export default function SalesTable() {
  const router = useRouter()
  const { role: authRole } = useAuth()
  const [sales, setSales] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [vendorRates, setVendorRates] = useState({})

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.orderNumber.localeCompare(b.orderNumber))
      setSales(data)
      setFiltered(data)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const rates = {}
      snapshot.docs.forEach((u) => {
        const d = u.data()
        if (d.rol === 'vendedor') {
          rates[u.id] = d.comision ?? 0
        }
      })
      setVendorRates(rates)
    })
    return () => unsubUsers()
  }, [])

  useEffect(() => {
    const term = search.toLowerCase()
    setFiltered(
      sales.filter(
        (s) =>
          s.orderNumber.toLowerCase().includes(term) ||
          s.client.name.toLowerCase().includes(term) ||
          s.items.some(
            (item) =>
              item.code.toLowerCase().includes(term) ||
              item.name.toLowerCase().includes(term)
          )
      )
    )
  }, [search, sales])

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

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((s) => {
        const row = {
          Orden: s.orderNumber,
          Cliente: s.client.name,
          Vendedor: s.seller,
        }
        if (authRole === 'root') {
          row['Comisión (%)'] = vendorRates[s.sellerId] ?? 0
        }
        row['Fecha'] = s.createdAt?.toDate().toLocaleString() || ''
        row['Total Bs'] = s.totalBs.toFixed(2)
        return row
      })
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Órdenes')
    XLSX.writeFile(wb, 'ordenes.xlsx')
  }

  const exportPdf = async () => {
    const pdfMakeModule = await import('pdfmake/build/pdfmake')
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts')
    const pdfMake = pdfMakeModule.default || pdfMakeModule
    const pdfFonts = pdfFontsModule.default || pdfFontsModule
    pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts

    const logoDataUrl = await getLogoDataUrl()
    const header = ['Orden', 'Cliente', 'Vendedor']
    if (authRole === 'root') {
      header.push('Comisión (%)')
    }
    header.push('Fecha', 'Total Bs')
    const body = [
      header,
      ...filtered.map((s) => {
        const row = [s.orderNumber, s.client.name, s.seller]
        if (authRole === 'root') {
          row.push(vendorRates[s.sellerId] ?? 0)
        }
        row.push(s.createdAt?.toDate().toLocaleString(), s.totalBs.toFixed(2))
        return row
      })
    ]
    const docDefinition = {
      content: [
        { image: logoDataUrl, width: 150, margin: [0, 0, 0, 10] },
        { text: 'Resumen de Órdenes', style: 'header' },
        { table: { headerRows: 1, widths: Array(header.length).fill('*'), body } }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
      }
    }
    pdfMake.createPdf(docDefinition).download('ordenes.pdf')
  }

  const handlePrint = () => {
    window.print()
  }

  const exportSaleExcel = (s) => {
    const ws = XLSX.utils.json_to_sheet(
      s.items.map((item) => ({
        Orden: s.orderNumber,
        Código: item.code,
        Nombre: item.name,
        'Tipo precio': item.priceType,
        Cantidad: item.quantity,
        'Subtotal Bs': item.subtotalBs.toFixed(2)
      }))
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Detalles')
    XLSX.writeFile(wb, `orden-${s.orderNumber}.xlsx`)
  }

  const exportSalePdf = async (s) => {
    const pdfMakeModule = await import('pdfmake/build/pdfmake')
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts')
    const pdfMake = pdfMakeModule.default || pdfMakeModule
    const pdfFonts = pdfFontsModule.default || pdfFontsModule
    pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts

    const logoDataUrl = await getLogoDataUrl()
    const body = [
      ['Código', 'Nombre', 'Tipo precio', 'Cantidad', 'Subtotal Bs'],
      ...s.items.map((item) => [
        item.code,
        item.name,
        item.priceType,
        item.quantity,
        item.subtotalBs.toFixed(2)
      ])
    ]
    const docDefinition = {
      content: [
        { image: logoDataUrl, width: 150, margin: [0, 0, 0, 10] },
        { text: `Orden ${s.orderNumber}`, style: 'header' },
        { table: { headerRows: 1, widths: ['*', '*', '*', '*', '*'], body } },
        { text: `Total Bs: ${s.totalBs.toFixed(2)}`, style: 'total' }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        total: { fontSize: 16, bold: true, margin: [0, 10, 0, 0] }
      }
    }
    pdfMake.createPdf(docDefinition).download(`orden-${s.orderNumber}.pdf`)
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
        <div className="relative">
          <FaSearch className="absolute left-3 top-2 text-gray-400" />
          <input
            type="text"
            className="pl-10 pr-4 py-2 border rounded w-full md:w-64"
            placeholder="Buscar orden, cliente o producto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orden
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendedor
              </th>
              {authRole === 'root' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisión (%)
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Bs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 whitespace-nowrap">{s.orderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{s.client.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{s.seller}</td>
                {authRole === 'root' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      step="0.01"
                      value={vendorRates[s.sellerId] ?? 0}
                      onChange={(e) =>
                        setVendorRates((prev) => ({
                          ...prev,
                          [s.sellerId]: e.target.value
                        }))
                      }
                      onBlur={async () => {
                        const rate = parseFloat(vendorRates[s.sellerId]) || 0
                        await updateDoc(doc(db, 'users', s.sellerId), { comision: rate })
                      }}
                      className="w-20 border px-2 py-1 rounded"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  {s.createdAt?.toDate().toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{s.totalBs.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => router.push(`${router.pathname}/${s.id}`)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <FaPrint />
                  </button>
                  <button
                    onClick={() => exportSalePdf(s)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaFilePdf />
                  </button>
                  <button
                    onClick={() => exportSaleExcel(s)}
                    className="text-green-600 hover:text-green-900"
                  >
                    <FaFileExcel />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}