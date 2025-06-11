  'use client'

  import { create } from 'zustand'
  import { persist, createJSONStorage } from 'zustand/middleware'
  import { io, Socket } from 'socket.io-client'

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

  // WebRTC related interfaces
  interface WebRTCCallbacks {
    onUserJoined?: (data: { userId: string, socketId: string }) => void
    onWebRTCOffer?: (data: { offer: RTCSessionDescriptionInit, sender: string }) => void
    onWebRTCAnswer?: (data: { answer: RTCSessionDescriptionInit, sender: string }) => void
    onWebRTCIceCandidate?: (data: { candidate: RTCIceCandidateInit, sender: string }) => void
    onUserLeft?: (data: { socketId: string }) => void
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

    // WebRTC methods
    addWebRTCListeners: (callbacks: WebRTCCallbacks) => void
    removeWebRTCListeners: () => void
    joinVideoRoom: (roomId: string) => void
    leaveVideoRoom: (roomId: string) => void
    sendWebRTCOffer: (target: string, offer: RTCSessionDescriptionInit, roomId: string) => void
    sendWebRTCAnswer: (target: string, answer: RTCSessionDescriptionInit) => void
    sendWebRTCIceCandidate: (target: string, candidate: RTCIceCandidateInit) => void
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

          // Your existing chat events
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

        // WebRTC Methods
        addWebRTCListeners: (callbacks) => {
          const { socket } = get()
          if (!socket) return

          console.log('adding listeners to userStore')

          socket.on('user-joined', callbacks.onUserJoined || (() => {}))
          socket.on('webrtc-offer', callbacks.onWebRTCOffer || (() => {}))
          socket.on('webrtc-answer', callbacks.onWebRTCAnswer || (() => {}))
          socket.on('webrtc-ice-candidate', callbacks.onWebRTCIceCandidate || (() => {}))
          socket.on('user-left', callbacks.onUserLeft || (() => {}))
        },

        removeWebRTCListeners: () => {
          const { socket } = get()
          if (!socket) return

          console.log('removing listeners from userStore')

          socket.off('user-joined')
          socket.off('webrtc-offer')
          socket.off('webrtc-answer')
          socket.off('webrtc-ice-candidate')
          socket.off('user-left')
        },

        joinVideoRoom: (roomId) => {
          const { socket, user } = get()
          if (!socket || !user) return

          

          socket.emit('join-room', { roomId, userId: user.id })
        },

        leaveVideoRoom: (roomId) => {
          const { socket } = get()
          if (!socket) return

          socket.emit('leave-room', { roomId })
        },

        sendWebRTCOffer: (target, offer, roomId) => {
          const { socket } = get()
          if (!socket) return

          socket.emit('webrtc-offer', { target, offer, roomId })
        },

        sendWebRTCAnswer: (target, answer) => {
          const { socket } = get()
          if (!socket) return

          socket.emit('webrtc-answer', { target, answer })
        },

        sendWebRTCIceCandidate: (target, candidate) => {
          const { socket } = get()
          if (!socket) return

          socket.emit('webrtc-ice-candidate', { target, candidate })
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







  // 'use client'

  // import { create } from 'zustand'
  // import { persist, createJSONStorage } from 'zustand/middleware'
  // import { io, Socket } from 'socket.io-client'

  // type Gender = 'MALE' | 'FEMALE'
  // type UserStatus = 'AVAILABLE' | 'AWAY' | 'BUSY' | 'INVISIBLE'

  // const backend = process.env.NEXT_PUBLIC_BACKEND_URL

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
  //   socket: Socket | null

  //   setUser: (user: User | null) => void
  //   updateUser: (updates: Partial<User>) => void
  //   logout: () => void

  //   connectSocket: () => void
  //   disconnectSocket: () => void
  // }



  // export const useUserStore = create<UserStore>()(
  //   persist(
  //     (set, get) => ({
  //       user: null,
  //       userStatus: false,
  //       socket: null,

  //       setUser: (user) => {
  //         set({ user, userStatus: !!user })
  //       },

  //       updateUser: (updates) => {
  //         set((state) => {
  //           if (!state.user) return state
  //           return { user: { ...state.user, ...updates } }
  //         })
  //       },

  //       connectSocket: () => {
  //         const { user, socket } = get()
  //         if (!user || socket) return

  //         const newSocket = io(`${backend}`, {
  //           auth: { token: user.id }, 
  //           autoConnect: true,
  //         })

  //         newSocket.on('connect', () => {
  //           console.log('Socket connected')
  //         })

  //         newSocket.on('disconnect', () => {
  //           console.log('Socket disconnected')
  //         })

  //         // Example event
  //         // newSocket.on('new_message', (data) => {
  //         //   console.log('New message:', data)
  //         // })

  //         set({ socket: newSocket })
  //       },

  //       disconnectSocket: () => {
  //         const { socket } = get()
  //         if (socket) {
  //           socket.removeAllListeners()
  //           socket.disconnect()
  //           console.log('Socket disconnected and cleaned up')
  //         }
  //         set({ socket: null })
  //       },

  //       logout: () => {
  //         get().disconnectSocket()
  //         set({ user: null, userStatus: false })
  //       },
  //     }),
  //     {
  //       name: 'user-storage',
  //       storage: createJSONStorage(() => localStorage, {
  //         reviver: (key, value) => {
  //           if ((key === 'lastSeen' || key === 'createdAt' || key === 'updatedAt') && typeof value === 'string') {
  //             return new Date(value)
  //           }
  //           return value
  //         },
  //         replacer: (key, value) => {
  //           if (value instanceof Date) {
  //             return value.toISOString()
  //           }
  //           return value
  //         },
  //       }),
  //       // Avoid persisting the socket instance
  //       partialize: (state) => ({
  //         user: state.user,
  //         userStatus: state.userStatus,
  //       }),
  //     }
  //   )
  // )




