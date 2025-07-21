import LayoutAdmin from '../../../components/LayoutAdmin'
import OrdersTable from '../../../components/OrdersTable'

export default function DespachosPage() {
  return (
    <LayoutAdmin>
      <h1 className="text-2xl font-bold mb-6">Control de fletes y despachos</h1>
      <OrdersTable />
    </LayoutAdmin>
  )
}