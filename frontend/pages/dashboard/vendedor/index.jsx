import LayoutVendedor from '../../../components/LayoutVendedor'
import DashboardCards from '../../../components/DashboardCards'

export default function VendedorDashboard() {
  return (
    <LayoutVendedor>
      <h1 className="text-2xl font-bold mb-6">Bienvenido al Panel de Ventas</h1>
      <DashboardCards />
    </LayoutVendedor>
  )
}