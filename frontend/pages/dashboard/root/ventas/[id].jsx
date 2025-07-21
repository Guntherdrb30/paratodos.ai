import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import LayoutRoot from '../../../../components/LayoutRoot'
import { db } from '../../../../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import * as XLSX from 'xlsx'
import { FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa'

export default function SaleDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchSale = async () => {
      const docRef = doc(db, 'sales', id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) setSale({ id: docSnap.id, ...docSnap.data() })
      setLoading(false)
    }
    fetchSale()
  }, [id])

  if (loading) return <p>Cargando...</p>
  if (!sale) return <p>Orden no encontrada.</p>

  const handlePrint = () => window.print()

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      sale.items.map((item) => ({
        Orden: sale.orderNumber,
        Código: item.code,
        Nombre: item.name,
        'Tipo precio': item.priceType,
        Cantidad: item.quantity,
        'Subtotal Bs': item.subtotalBs.toFixed(2)
      }))
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Detalles')
    XLSX.writeFile(wb, `orden-${sale.orderNumber}.xlsx`)
  }

  // helper para cargar el logo y devolverlo como dataURL
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
      ['Código', 'Nombre', 'Tipo precio', 'Cantidad', 'Subtotal Bs'],
      ...sale.items.map((item) => [
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
        { text: `Orden ${sale.orderNumber}`, style: 'header' },
        { text: `Cliente: ${sale.client.name}`, margin: [0, 0, 0, 10] },
        { table: { headerRows: 1, widths: ['*', '*', '*', '*', '*'], body } },
        { text: `Total Bs: ${sale.totalBs.toFixed(2)}`, style: 'total' }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        total: { fontSize: 16, bold: true, margin: [0, 10, 0, 0] }
      }
    }
    pdfMake.createPdf(docDefinition).download(`orden-${sale.orderNumber}.pdf`)
  }

  return (
    <LayoutRoot>
      <div className="mb-4">
        <button onClick={() => router.back()} className="text-primary">
          ← Volver
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">Detalle Orden {sale.orderNumber}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div><strong>Cliente:</strong> {sale.client.name}</div>
        <div><strong>Cédula/RIF:</strong> {sale.client.id}</div>
        <div><strong>Dirección:</strong> {sale.client.address}</div>
        <div><strong>Teléfono:</strong> {sale.client.phone}</div>
        <div><strong>Vendedor:</strong> {sale.seller}</div>
        <div><strong>Fecha:</strong> {sale.createdAt?.toDate().toLocaleString()}</div>
      </div>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo precio</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal Bs</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sale.items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 whitespace-nowrap">{item.code}</td>
                <td className="px-3 py-2 whitespace-nowrap">{item.name}</td>
                <td className="px-3 py-2 whitespace-nowrap">{item.priceType}</td>
                <td className="px-3 py-2 whitespace-nowrap">{item.quantity}</td>
                <td className="px-3 py-2 whitespace-nowrap">{item.subtotalBs.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          <FaPrint className="mr-2" /> Reimprimir
        </button>
        <button
          onClick={exportPdf}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:opacity-75"
        >
          <FaFilePdf className="mr-2" /> PDF
        </button>
        <button
          onClick={exportExcel}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:opacity-75"
        >
          <FaFileExcel className="mr-2" /> Excel
        </button>
      </div>
    </LayoutRoot>
  )
}