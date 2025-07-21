import LayoutAdmin from '../../../../components/LayoutAdmin'
import InventoryTable from '../../../../components/InventoryTable'

export default function InventarioPage() {
  return (
    <LayoutAdmin>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
      </div>
      <InventoryTable />
    </LayoutAdmin>
  )
}