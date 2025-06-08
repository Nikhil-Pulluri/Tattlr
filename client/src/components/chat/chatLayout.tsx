'use client'
import React, { useState, useEffect } from 'react'
import ChatSidebar from './chatSidebar'
import ChatWindow from './chatWindow'
import { useUserStore } from '@/store/userStore'
import { useUserMessagesMap } from '@/hooks/getUserMessagesMap'
import { useUserConversations } from '@/hooks/getUserConversations'
import { useQueryClient } from '@tanstack/react-query'

interface Message {
  id: string
  conversationId: string
  senderId: string
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'LOCATION' | 'SYSTEM'
  status: 'SENT' | 'DELIVERED' | 'READ'
  isDeleted: boolean
  isEdited: boolean
  content?: {
    text?: string
    mediaUrl?: string
    fileName?: string
    fileSize?: number
    mimeType?: string
    location?: {
      latitude: number
      longitude: number
      address?: string
    }
    systemAction?: 'USER_JOINED' | 'USER_LEFT' | 'USER_ADDED' | 'USER_REMOVED' | 'GROUP_CREATED' | 'GROUP_RENAMED'
  }
  replyToId?: string
  createdAt: string
  updatedAt: string
}

const ChatLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isClient, setIsClient] = useState(false)
  const { user, userStatus } = useUserStore()

  const socketConnection = useUserStore((state) => state.socket)

  const queryClient = useQueryClient()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: conversations = [], refetch: refetchConversations, isLoading, isError, error } = useUserConversations(user?.id)

  const conversationIds = conversations.map((conv) => conv.id)

  const { data: messagesMap = {}, isLoading: messagesLoading, refetch: refetchMessages } = useUserMessagesMap(conversationIds)

  useEffect(() => {
    if (socketConnection && user?.id && conversationIds.length > 0) {
      // console.log(conversationIds.length)
      conversationIds.forEach((conversationId) => {
        socketConnection.emit('joinRoom', {
          conversationId,
          userId: user.id,
        })
      })
    }
  }, [socketConnection, user?.id, conversationIds])

  const sortMessages = (messages: Message[]): Message[] => {
    return [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  useEffect(() => {
    const handler = (message: Message) => {
      if (message.senderId !== user?.id) {
        // console.log('message received', message)

        // ✅ Update query cache safely
        queryClient.setQueryData<{ [conversationId: string]: Message[] }>(['messagesMap', conversationIds], (oldData) => {
          if (!oldData) return {}

          const existingMessages = oldData[message.conversationId] || []

          // Check if message already exists to prevent duplicates
          const messageExists = existingMessages.some((msg) => msg.id === message.id)
          if (messageExists) {
            return oldData
          }

          const updatedMessages = sortMessages([...existingMessages, message])

          // console.log('updatedMessages', updatedMessages)

          setTimeout(() => {
            refetchConversations()
          }, 300)

          return {
            ...oldData,
            [message.conversationId]: updatedMessages,
          }
        })
      }
    }

    socketConnection?.on('newMessage', handler)

    return () => {
      socketConnection?.off('newMessage', handler)
    }
  }, [socketConnection, user?.id, conversationIds, queryClient])

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId) || null

  // Update messages from query cache, ensuring they're sorted
  useEffect(() => {
    if (selectedConversationId && messagesMap[selectedConversationId]) {
      refetchMessages()
      const sortedMessages = sortMessages(messagesMap[selectedConversationId])
      setMessages(sortedMessages)
    } else if (selectedConversationId) {
      setMessages([])
    }
  }, [selectedConversationId, messagesMap])

  const handleConversationSelect = (conversationId: string): void => {
    setSelectedConversationId(conversationId)
  }

  const handleSendMessage = (messageText: string): void => {
    if (selectedConversationId && user) {
      const newMessage: Message = {
        id: `msg_${Date.now()}_${Math.random()}`, // More unique ID generation
        conversationId: selectedConversationId,
        senderId: user.id,
        messageType: 'TEXT',
        status: 'SENT',
        isDeleted: false,
        isEdited: false,
        content: { text: messageText },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Update local state immediately for better UX
      setMessages((prev) => sortMessages([...prev, newMessage]))

      // Update query cache immediately
      queryClient.setQueryData<{ [conversationId: string]: Message[] }>(['messagesMap', conversationIds], (oldData) => {
        if (!oldData) return { [selectedConversationId]: [newMessage] }

        const existingMessages = oldData[selectedConversationId] || []
        const updatedMessages = sortMessages([...existingMessages, newMessage])

        setTimeout(() => {
          refetchConversations()
        }, 300)

        return {
          ...oldData,
          [selectedConversationId]: updatedMessages,
        }
      })

      try {
        socketConnection?.emit('sendMessage', {
          conversationId: selectedConversationId,
          senderId: user.id,
          messageType: 'TEXT',
          content: {
            text: messageText,
          },
        })
      } catch (error) {
        console.log('error sending message via socket', error)

        // Rollback on error
        setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id))
        queryClient.setQueryData<{ [conversationId: string]: Message[] }>(['messagesMap', conversationIds], (oldData) => {
          if (!oldData) return {}

          const existingMessages = oldData[selectedConversationId] || []
          const rolledBackMessages = existingMessages.filter((msg) => msg.id !== newMessage.id)

          return {
            ...oldData,
            [selectedConversationId]: rolledBackMessages,
          }
        })

        throw error
      }
    }
  }

  if (!isClient) {
    return (
      <div className="flex h-screen bg-white dark:bg-neutral-800">
        <div className="w-full sm:w-80 md:w-96 lg:w-80 xl:w-96 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-700">
          <div className="p-4">Loading...</div>
        </div>

        <div className="hidden sm:flex flex-1 items-center justify-center">
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-neutral-800">
      <ChatSidebar conversations={conversations} selectedConversationId={selectedConversationId} onConversationSelect={handleConversationSelect} />
      <ChatWindow conversation={selectedConversation} messages={messages} onSendMessage={handleSendMessage} currentUserId={user?.id || 'current-user-id'} />
      {children}
    </div>
  )
}

export default ChatLayout
