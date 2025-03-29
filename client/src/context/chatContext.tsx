'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { Socket } from 'socket.io-client'

interface ChatContextType {
  selectedChatId: string | null
  setSelectedChatId: (id: string | null) => void
  isTyping: boolean
  setIsTyping: (typing: boolean) => void
  socket: Socket | null
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // Get the existing socket from localStorage
    const existingSocket = localStorage.getItem('socket')
    if (existingSocket) {
      setSocket(JSON.parse(existingSocket))
    }
  }, [])

  useEffect(() => {
    if (socket && selectedChatId) {
      // Emit typing status when isTyping changes
      socket.emit('typing', { chatId: selectedChatId, isTyping })
    }
  }, [isTyping, selectedChatId, socket])

  return <ChatContext.Provider value={{ selectedChatId, setSelectedChatId, isTyping, setIsTyping, socket }}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
