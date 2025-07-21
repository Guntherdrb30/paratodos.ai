import LayoutAdmin from '../../../components/LayoutAdmin'
import DashboardCards from '../../../components/DashboardCards'

export default function AdminDashboard() {
  return (
    <LayoutAdmin>
      <h1 className="text-2xl font-bold mb-6">Bienvenido al Panel de Administración</h1>
      <DashboardCards />
    </LayoutAdmin>
  )
}