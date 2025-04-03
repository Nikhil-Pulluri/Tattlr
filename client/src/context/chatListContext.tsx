'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUserData } from './userDataContext'
import { ChatUser } from './userDataContext'

interface ChatListContextType {
  chatUsers: ChatUser[]
  updateChatList: () => Promise<void>
}

const ChatListContext = createContext<ChatListContextType | undefined>(undefined)

export function ChatListProvider({ children }: { children: React.ReactNode }) {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([])
  const { userData } = useUserData()

  const updateChatList = async () => {
    if (userData?.chats) {
      setChatUsers(userData.chats)
    }
  }

  useEffect(() => {
    updateChatList()
  }, [userData])

  return <ChatListContext.Provider value={{ chatUsers, updateChatList }}>{children}</ChatListContext.Provider>
}

export function useChatList() {
  const context = useContext(ChatListContext)
  if (context === undefined) {
    throw new Error('useChatList must be used within a ChatListProvider')
  }
  return context
}
