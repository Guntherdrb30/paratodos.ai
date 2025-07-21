import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext({
  user: null,
  role: null,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        setUser(user)
        try {
          let data = null
          const refUsers = doc(db, 'users', user.uid)
          const snapUsers = await getDoc(refUsers)
          if (snapUsers.exists()) {
            data = snapUsers.data()
          } else {
            const refUser = doc(db, 'user', user.uid)
            const snapUser = await getDoc(refUser)
            if (snapUser.exists()) {
              data = snapUser.data()
            }
          }
          setRole(data?.rol ?? data?.role ?? null)
        } catch (error) {
          console.error('Error obteniendo rol de usuario:', error)
          setRole(null)
        }
      } else {
        setUser(null)
        setRole(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}