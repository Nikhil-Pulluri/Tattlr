'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import jwtDecode from 'jsonwebtoken'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  signIn: (token: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt')
    if (storedToken) {
      setToken(storedToken)
      try {
        const decoded = jwtDecode.decode(storedToken) as User
        setUser(decoded)
      } catch (error) {
        console.error('Invalid token:', error)
        signOut()
      }
    }
  }, [])

  const signIn = (newToken: string) => {
    localStorage.setItem('jwt', newToken)
    setToken(newToken)

    try {
      const decoded = jwtDecode.decode(newToken) as User
      setUser(decoded)
      console.log('User signed in:', decoded)
    } catch (error) {
      console.error('Invalid token:', error)
    }
  }

  const signOut = () => {
    localStorage.removeItem('jwt')
    setToken(null)
    setUser(null)
  }

  // Track token and user changes
  useEffect(() => {
    console.log('Updated Token:', token)
    console.log('Updated User:', user)
  }, [token, user])

  return <AuthContext.Provider value={{ user, token, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
