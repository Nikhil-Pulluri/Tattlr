'use client'
import React, { createContext, useContext, useState } from 'react'

interface ChatContextType {
  selectedChatId: string | null
  setSelectedChatId: (id: string | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  return <ChatContext.Provider value={{ selectedChatId, setSelectedChatId }}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
