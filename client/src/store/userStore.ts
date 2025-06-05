'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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

interface UserStore {
  user: User | null
  userStatus: boolean
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      userStatus: false,

      setUser: (user) => {
        set({ user, userStatus: !!user })
      },

      updateUser: (updates) => {
        set((state) => {
          if (!state.user) return state
          return { user: { ...state.user, ...updates } }
        })
      },

      logout: () => {
        set({ user: null, userStatus: false })
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          // Convert ISO strings back to Date objects for specific keys
          if ((key === 'lastSeen' || key === 'createdAt' || key === 'updatedAt') && typeof value === 'string') {
            return new Date(value)
          }
          return value
        },
        replacer: (key, value) => {
          // Convert Date objects to ISO strings
          if (value instanceof Date) {
            return value.toISOString()
          }
          return value
        },
      }),
    }
  )
)
