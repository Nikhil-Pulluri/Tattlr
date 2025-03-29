'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import jwtDecode from 'jsonwebtoken'

interface User {
  id: string
  email: string
  name?: string
}

interface JWTDecoded {
  sub: string
  username: string
  iat: number
  exp: number
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
      console.log('Found stored token, attempting to decode...')
      setToken(storedToken)
      try {
        const decoded = jwtDecode.decode(storedToken) as JWTDecoded
        console.log('Successfully decoded token:', decoded)

        // Map JWT fields to User interface
        const userData: User = {
          id: decoded.sub,
          email: decoded.username, // Using username as email since that's what we have
          name: decoded.username, // Using username as name since that's what we have
        }
        console.log('Mapped user data:', userData)
        setUser(userData)
      } catch (error) {
        console.error('Invalid token:', error)
        signOut()
      }
    } else {
      console.log('No stored token found')
    }
  }, [])

  const signIn = (newToken: string) => {
    console.log('Signing in with new token...')
    localStorage.setItem('jwt', newToken)
    setToken(newToken)

    try {
      const decoded = jwtDecode.decode(newToken) as JWTDecoded
      console.log('Successfully decoded new token:', decoded)

      // Map JWT fields to User interface
      const userData: User = {
        id: decoded.sub,
        email: decoded.username,
        name: decoded.username,
      }
      console.log('Mapped user data:', userData)
      setUser(userData)
    } catch (error) {
      console.error('Invalid token during sign in:', error)
    }
  }

  const signOut = () => {
    console.log('Signing out...')
    localStorage.removeItem('jwt')
    setToken(null)
    setUser(null)
  }

  // Track token and user changes
  useEffect(() => {
    console.log('Auth state updated:', {
      hasToken: !!token,
      hasUser: !!user,
      userData: user,
    })
  }, [token, user])

  return <AuthContext.Provider value={{ user, token, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
