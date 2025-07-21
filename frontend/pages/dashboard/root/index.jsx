import LayoutRoot from '../../../components/LayoutRoot'
import DashboardCards from '../../../components/DashboardCards'

export default function RootDashboard() {
  return (
    <LayoutRoot>
      <h1 className="text-2xl font-bold mb-6">
        Bienvenido al Panel Raíz del Sistema Carpi Hogar
      </h1>
      <DashboardCards />
    </LayoutRoot>
  )
}