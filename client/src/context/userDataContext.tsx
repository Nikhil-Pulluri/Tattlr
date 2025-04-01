'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './jwtContext'

export interface MessageAttachment {
  id: string
  url: string
  type: string
  messageId: string
  createdAt: Date
  updatedAt: Date
}

export interface MessageRead {
  id: string
  messageId: string
  userId: string
  readAt: Date
  message: Message
  user: User
}

export interface Message {
  id: string
  text: string | null
  chatId: string
  senderId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  attachments: MessageAttachment[]
  readBy: MessageRead[]
  chat: Chat
  sender: User
}

export interface ChatUser {
  id: string
  userId: string
  chatId: string
  lastReadAt: Date | null
  user: User
  chat: Chat
}

// export interface TypingStatus {
//   id: string
//   userId: string
//   chatId: string
//   isTyping: boolean
//   user: User
//   chat: Chat
// }

export interface Chat {
  id: string
  messages: Message[]
  users: ChatUser[]
  unread: number
  lastmessage: string | null
  lastTime: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface User {
  id: string
  email: string
  name: string
  username: string
  phnum: string
  chats: ChatUser[]
  // messages: MessageRead[]
  // typing: TypingStatus[]
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  Message: Message[]
  role: string | null
}

interface UserDataContextType {
  userData: User | null
  setUserData: (data: User | null) => void
  isLoading: boolean
  error: string | null
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined)

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, token } = useAuth()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !token) {
        console.log('No user or token available')
        setUserData(null)
        setIsLoading(false)
        return
      }

      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
        if (!backendUrl) {
          throw new Error('Backend URL is not defined')
        }

        console.log('Fetching user data for user:', user.id)
        const response = await fetch(`${backendUrl}/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await response.json()
        console.log('Received user data:', {
          id: data.id,
          email: data.email,
          name: data.name,
          username: data.username,
          hasChats: !!data.chats,
          chatsLength: data.chats?.length,
          fullData: data,
        })

        // Ensure the data has the correct structure
        if (!data.chats) {
          console.warn('User data does not have chats array')
          data.chats = []
        }
        if (!data.messages) {
          console.warn('User data does not have messages array')
          data.messages = []
        }
        if (!data.typing) {
          console.warn('User data does not have typing array')
          data.typing = []
        }
        if (!data.Message) {
          console.warn('User data does not have Message array')
          data.Message = []
        }

        setUserData(data)
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch user data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user, token])

  // Log when userData changes
  useEffect(() => {
    console.log('UserData state updated:', {
      hasUserData: !!userData,
      userId: userData?.id,
      hasChats: !!userData?.chats,
      chatsLength: userData?.chats?.length,
    })
  }, [userData])

  return <UserDataContext.Provider value={{ userData, setUserData, isLoading, error }}>{children}</UserDataContext.Provider>
}

export function useUserData() {
  const context = useContext(UserDataContext)
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider')
  }
  return context
}
