'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { io, Socket } from 'socket.io-client'
import { useEffect } from 'react'

type Gender = 'MALE' | 'FEMALE'
type UserStatus = 'AVAILABLE' | 'AWAY' | 'BUSY' | 'INVISIBLE'

const backend = process.env.NEXT_PUBLIC_BACKEND_URL

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
  socket: Socket | null

  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void

  connectSocket: () => void
  disconnectSocket: () => void
}



export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      userStatus: false,
      socket: null,

      setUser: (user) => {
        set({ user, userStatus: !!user })
      },

      updateUser: (updates) => {
        set((state) => {
          if (!state.user) return state
          return { user: { ...state.user, ...updates } }
        })
      },

      connectSocket: () => {
        const { user, socket } = get()
        if (!user || socket) return

        const newSocket = io(`${backend}`, {
          auth: { token: user.id }, 
          autoConnect: true,
        })

        newSocket.on('connect', () => {
          console.log('Socket connected')
        })

        newSocket.on('disconnect', () => {
          console.log('Socket disconnected')
        })

        // Example event
        // newSocket.on('new_message', (data) => {
        //   console.log('New message:', data)
        // })

        set({ socket: newSocket })
      },

      disconnectSocket: () => {
        const { socket } = get()
        if (socket) {
          socket.removeAllListeners()
          socket.disconnect()
          console.log('Socket disconnected and cleaned up')
        }
        set({ socket: null })
      },

      logout: () => {
        get().disconnectSocket()
        set({ user: null, userStatus: false })
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          if ((key === 'lastSeen' || key === 'createdAt' || key === 'updatedAt') && typeof value === 'string') {
            return new Date(value)
          }
          return value
        },
        replacer: (key, value) => {
          if (value instanceof Date) {
            return value.toISOString()
          }
          return value
        },
      }),
      // Avoid persisting the socket instance
      partialize: (state) => ({
        user: state.user,
        userStatus: state.userStatus,
      }),
    }
  )
)







// import { create } from 'zustand'
// import { persist, createJSONStorage } from 'zustand/middleware'

// type Gender = 'MALE' | 'FEMALE'
// type UserStatus = 'AVAILABLE' | 'AWAY' | 'BUSY' | 'INVISIBLE'

// interface User {
//   id: string
//   name: string
//   username: string
//   email: string
//   mobile: string
//   password: string
//   profilePicture?: string
//   gender: Gender
//   isOnline: boolean
//   lastSeen: Date
//   socketId?: string
//   status: UserStatus
//   createdAt: Date
//   updatedAt: Date
// }

// interface UserStore {
//   user: User | null
//   userStatus: boolean
//   setUser: (user: User | null) => void
//   updateUser: (updates: Partial<User>) => void
//   logout: () => void
// }

// export const useUserStore = create<UserStore>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       userStatus: false,

//       setUser: (user) => {
//         set({ user, userStatus: !!user })
//       },

//       updateUser: (updates) => {
//         set((state) => {
//           if (!state.user) return state
//           return { user: { ...state.user, ...updates } }
//         })
//       },

//       logout: () => {
//         set({ user: null, userStatus: false })
//       },
//     }),
//     {
//       name: 'user-storage',
//       storage: createJSONStorage(() => localStorage, {
//         reviver: (key, value) => {
//           // Convert ISO strings back to Date objects for specific keys
//           if ((key === 'lastSeen' || key === 'createdAt' || key === 'updatedAt') && typeof value === 'string') {
//             return new Date(value)
//           }
//           return value
//         },
//         replacer: (key, value) => {
//           // Convert Date objects to ISO strings
//           if (value instanceof Date) {
//             return value.toISOString()
//           }
//           return value
//         },
//       }),
//     }
//   )
// )
