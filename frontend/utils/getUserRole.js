import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { devError } from './devLog'

export async function getUserRole(userId) {
  try {
    if (!userId) return null

    let data = null
    const refUsers = doc(db, 'users', userId)
    const snapUsers = await getDoc(refUsers)
    if (snapUsers.exists()) {
      data = snapUsers.data()
    } else {
      const refUser = doc(db, 'user', userId)
      const snapUser = await getDoc(refUser)
      if (snapUser.exists()) {
        data = snapUser.data()
      }
    }

    return data?.rol ?? data?.role ?? null
  } catch (error) {
    devError('Error obteniendo rol de usuario:', error)
    return null
  }
}
