import LayoutRoot from '../../../../components/LayoutRoot'
import InventoryTable from '../../../../components/InventoryTable'

export default function InventarioPage() {
  return (
    <LayoutRoot>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
      </div>
      <InventoryTable />
    </LayoutRoot>
  )
}