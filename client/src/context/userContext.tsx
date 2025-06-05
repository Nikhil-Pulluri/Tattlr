'use client'
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type Gender = 'MALE' | 'FEMALE'
type UserStatus = 'AVAILABLE' | 'AWAY' | 'BUSY' | 'INVISIBLE'

interface User {
  id: string
  name: string
  username: string
  email: string
  mobile: string
  password: string
  profilePicture?: string
  gender: Gender
  isOnline: boolean
  lastSeen: Date
  socketId?: string
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  userStatus: boolean
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userStatus, setUserStatus] = useState<boolean>(false)

  useEffect(() => {
    if (user) {
      setUserStatus(true)
    }
  }, [user])

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null))
  }

  const logout = () => {
    setUser(null)
  }

  return <UserContext.Provider value={{ user, setUser, updateUser, logout, userStatus }}>{children}</UserContext.Provider>
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
