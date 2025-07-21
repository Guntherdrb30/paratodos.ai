import Link from 'next/link'

const menuItems = [
  { name: 'Panel general', href: '/dashboard/admin' },
  { name: 'Gestión de usuarios', href: '/dashboard/admin/usuarios' },
  { name: 'Gestión de productos', href: '/dashboard/admin/productos' },
  { name: 'Gestión de inventario', href: '/dashboard/admin/inventario' },
  { name: 'Gestión de ventas', href: '/dashboard/admin/ventas' },
  { name: 'Gestión de comisiones por vendedor', href: '/dashboard/admin/comisiones' },
  { name: 'Control de proyectos por cliente', href: '/dashboard/admin/proyectos' },
  { name: 'Control de proveedores y deudas por proyecto', href: '/dashboard/admin/proveedores' },
  { name: 'Control de fletes y despachos', href: '/dashboard/admin/despachos' },
  { name: 'Reportes y estadísticas', href: '/dashboard/admin/reportes' },
  { name: 'Configuración general', href: '/dashboard/admin/configuracion' },
]

export default function SidebarAdmin() {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-secondary text-white pt-16">
      <nav className="flex flex-col space-y-2 p-4">
        {menuItems.map((item) => (
          <Link key={item.name} href={item.href} className="py-2 px-3 rounded hover:bg-primary transition">
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}