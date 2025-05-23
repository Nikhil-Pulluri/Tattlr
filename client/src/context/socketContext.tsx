'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { Socket, io } from 'socket.io-client'
import { useAuth } from '@/context/jwtContext'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendUrl) {
      console.error('Backend URL is not defined')
      return
    }

    console.log('Initializing socket connection to:', backendUrl)
    const socketIo = io(`${backendUrl}/chat`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 10,
      timeout: 10000,
    })

    function handleConnection() {
      socketIo.on('connect', () => {
        console.log('Connected to chat WebSocket server')
        setIsConnected(true)

        // Join the chat room with user ID when connected
        if (user?.id) {
          console.log('Joining chat with user ID:', user.id)
          socketIo.emit('join', { userId: user.id })
        }
      })
    }

    handleConnection()

    socketIo.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
      handleConnection()
    })

    socketIo.on('disconnect', (reason) => {
      console.log('Disconnected from chat WebSocket server:', reason)
      setIsConnected(false)
    })

    socketIo.on('error', (error) => {
      console.error('Socket error:', error)
      handleConnection()
    })

    setSocket(socketIo)

    return () => {
      console.log('Cleaning up socket connection')
      socketIo.close()
    }
  }, [user?.id]) // Reconnect when user ID changes

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
