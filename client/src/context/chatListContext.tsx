'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { ChatUser } from './userDataContext'
import { useUserData } from './userDataContext'

interface ChatListContextType {
  chatUsers: ChatUser[]
  setChatUsers: React.Dispatch<React.SetStateAction<ChatUser[]>>
}

const ChatListContext = createContext<ChatListContextType | undefined>(undefined)

export function ChatListProvider({ children }: { children: React.ReactNode }) {
  const { userData } = useUserData()
  const [chatUsers, setChatUsers] = useState<ChatUser[]>(
    userData?.chats.map((cu: ChatUser) => ({
      ...cu,
      chat: {
        ...cu.chat,
        lastTime: cu.chat.lastTime,
      },
    })) || []
  )

  return <ChatListContext.Provider value={{ chatUsers, setChatUsers }}>{children}</ChatListContext.Provider>
}

export function useChatList() {
  const context = useContext(ChatListContext)
  if (context === undefined) {
    throw new Error('useChatList must be used within a ChatListProvider')
  }
  return context
}
