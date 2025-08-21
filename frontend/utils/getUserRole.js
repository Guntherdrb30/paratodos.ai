import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * Busca el rol del usuario en las colecciones "users" y "user".
 * @param {string} userId - UID del usuario autenticado.
 * @returns {Promise<string|null>} Rol encontrado o `null` si no existe.
 */
export async function getUserRole(userId) {
  if (!userId) return null
  try {
    const usersSnap = await getDoc(doc(db, 'users', userId))
    if (usersSnap.exists()) {
      const data = usersSnap.data()
      return data.role ?? data.rol ?? null
    }

    const userSnap = await getDoc(doc(db, 'user', userId))
    if (userSnap.exists()) {
      const data = userSnap.data()
      return data.role ?? data.rol ?? null
    }

    return null
  } catch (error) {
    console.error('Error obteniendo rol de usuario:', error)
    return null
  }
}
