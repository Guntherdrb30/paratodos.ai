import Link from 'next/link'

const menuItems = [
  { name: 'Panel general', href: '/dashboard/vendedor' },
  { name: 'Gestión de ventas', href: '/dashboard/vendedor/ventas' },
  { name: 'Gestión de inventario', href: '/dashboard/vendedor/inventario' },
  { name: 'Gestión de comisiones', href: '/dashboard/vendedor/comisiones' },
]

export default function SidebarVendedor() {
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