/**
 * Redirige al usuario a la ruta correspondiente según su rol
 * @param {{ push: (path: string) => void }} router - objeto router de Next.js
 * @param {string|null} role - rol del usuario
 */
export function redirectByRole(router, role) {
  const r = role ? role.toLowerCase().trim() : ''
  switch (r) {
    case 'root':
      router.push('/dashboard/root')
      break
    case 'admin':
      router.push('/dashboard/admin')
      break
    case 'vendedor':
      router.push('/dashboard/vendedor')
      break
    case 'despacho':
      router.push('/dashboard/despacho')
      break
    case 'cliente':
      router.push('/tienda')
      break
    default:
      router.push('/auth/login')
      break
  }
}