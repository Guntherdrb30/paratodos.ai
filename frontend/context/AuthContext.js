import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { getUserRole } from '../utils/getUserRole'

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
        const role = await getUserRole(user.uid)
        setRole(role)
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
